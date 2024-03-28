import boto3
from datetime import datetime
from time import sleep

cloudwatchlogs_client = boto3.client('logs')

def get_log_groups(next_token=None):
    log_group_request = {
        'limit': 50  # Maximum
    }
    if next_token:
        log_group_request['nextToken'] = next_token
    log_groups_response = cloudwatchlogs_client.describe_log_groups(**log_group_request)
    if log_groups_response:
        for log_group in log_groups_response['logGroups']:
            yield log_group
        if 'nextToken' in log_groups_response:
            yield from get_log_groups(log_groups_response['nextToken'])

def get_streams(log_group, next_token=None):
    log_stream_request = {
        'logGroupName': log_group['logGroupName'],
        'limit': 50  # Max
    }
    if next_token:
        log_stream_request['nextToken'] = next_token

    response = cloudwatchlogs_client.describe_log_streams(**log_stream_request)

    if response:
        for log_stream in response['logStreams']:
            yield log_stream
        if 'nextToken' in response:
            yield from get_streams(log_group, response['nextToken'])

def has_stream(log_group):
    log_stream_request = {
        'logGroupName': log_group['logGroupName'],
        'limit': 50  # Max
    }
    response = cloudwatchlogs_client.describe_log_streams(**log_stream_request)

    if response and response['logStreams']:
        return True
    return False


def cloudwatch_set_retention(log_group):
    retention = 30

    if 'retentionInDays' not in log_group:
        print("log group {} has infinite retention, updating retention period".format(log_group['logGroupName']) )
        log_group['retentionInDays']=retention
        cloudwatchlogs_client.put_retention_policy(
            logGroupName=log_group['logGroupName'], retentionInDays=log_group['retentionInDays']
        )


def delete_old_streams(log_group):
    if 'retentionInDays' not in log_group:
        print("log group {} has infinite retention, skipping".format(log_group['logGroupName']) )
        return

    for log_stream in get_streams(log_group):
        #check to prevent accidental delete
        if 'lastEventTimestamp' not in log_stream:
            continue
        else:
            diff_millis = datetime.now().timestamp() * 1000 - log_stream['lastIngestionTime']
            diff_days = diff_millis / (1000 * 86400)

        if diff_days > log_group['retentionInDays']:
            print("Deleting stream: {} in log group {} ".format(log_stream['logStreamName'], log_group['logGroupName']))
            try:
                cloudwatchlogs_client.delete_log_stream(
                    logGroupName=log_group['logGroupName'],
                    logStreamName=log_stream['logStreamName']
                )
                print("Stream deleted")
                #pause every 200 ms to skip rate exceeded errors as too many API calls are made in short time
                sleep(0.2)
            except Exception as e:
                if e.response['Error']['Message'] == "Rate exceeded":
                    print("We've hit a rate limit error so we are stopping for this log group.")
                else:
                    print("Error deleting log stream", e.response['Error']['Message'])
                return


def delete_old_group(log_group):
    if 'retentionInDays' not in log_group:
        log_group['retentionInDays'] = 30

    if 'creationTime' not in log_group:
        return
    else:
        diff_millis = datetime.now().timestamp() * 1000 - log_group['creationTime']
        diff_days = diff_millis / (1000 * 86400)

    # Check if the log group is managed by a CFN stack
    response = cloudwatchlogs_client.list_tags_log_group(
        logGroupName=log_group['logGroupName']
    )
    stack_name = None
    if response and response['tags'] and 'aws:cloudformation:stack-name' in response['tags']:
        stack_name = response['tags']['aws:cloudformation:stack-name']

    # Allow log groups to be deleted if they do not have any log streams or are not managed by a CFN stack
    deletable = not stack_name or not has_stream(log_group)

    # Delete any log groups older than 60 days
    if diff_days > log_group['retentionInDays'] and deletable:
        print("Deleting empty log group: {} ".format(log_group['logGroupName']))
        cloudwatchlogs_client.delete_log_group(
            logGroupName=log_group['logGroupName'],
        )


def lambda_handler(event, context):
    for log_group in get_log_groups():
        cloudwatch_set_retention(log_group)
        delete_old_streams(log_group)
        delete_old_group(log_group)

if __name__ == '__main__':
    lambda_handler({}, {})
