import boto3
from botocore.exceptions import ClientError
import csv
from io import StringIO
import os


profile = os.getenv('AWS_PROFILE')
boto3.setup_default_session(profile_name=profile)
s3 = boto3.resource('s3')
s3client = boto3.client('s3')

def get_buckets():
    buckets = []
    for bucket in s3.buckets.all():
        name = bucket.name
        region = get_bucket_region(name)

        cloudformation_id = get_cloudformation_id(name)

        logging = get_bucket_logging(name)
        versioning = get_bucket_versioning(name)
        access = get_public_access_policy(name)

        bucket_info = {
            'name': name,
            'region': region,
            'stack': cloudformation_id,
            'access': access,
            'logging': logging,
            'versioning': versioning,
        }
        buckets.append(bucket_info)

    return buckets

def get_bucket_region(bucket:str):
    try:
        response = s3client.get_bucket_location(
            Bucket=bucket,
        )

        return response.get('LocationConstraint', '')
    except ClientError:
        pass

def get_cloudformation_id(bucket: str):
    try:
        response = s3client.get_bucket_tagging(
            Bucket=bucket,
        )

        stack = 'no-stack'
        resource = ''

        for tag in response['TagSet']:
            if tag['Key'] == 'aws:cloudformation:stack-name':
                stack = tag['Value']
            if tag['Key'] == 'aws:cloudformation:logical-id':
                resource = tag['Value']


        return f"{stack}/{resource}"
    except ClientError:
        pass

def get_bucket_logging(bucket: str):
    bucket_logging = s3.BucketLogging(bucket)
    return True if bucket_logging.logging_enabled else False

def get_bucket_versioning(bucket: str):
    bucket_versioning = s3.BucketVersioning(bucket)
    return bucket_versioning.status

def get_public_access_policy(bucket: str):
    try:
        response = s3client.get_public_access_block(
            Bucket=bucket,
        )

        block_access_configuration = response.get('PublicAccessBlockConfiguration', {})

        block_access = True if block_access_configuration.get('BlockPublicAcls') and block_access_configuration.get('BlockPublicPolicy') else False
        policy_access = 'public' if response.get('PolicyStatus', {}).get('IsPublic') else 'not public'

        return {
            'public_access_blocked': block_access,
            'bucket_policy_status': policy_access
        }
    except ClientError:
        pass


if __name__ == '__main__':
    buckets = get_buckets()

    # Get the buckets with issues.
    def bucket_conditions(bucket):
        return True if (not bucket.get('region', '') == 'eu-west-1' or
                        not bucket.get('access', {}) or
                        not bucket.get('access', {}).get('public_access_blocked', False) or
                        bucket.get('access', {}).get('public_access_blocked', False) == 'not public' or
                        not bucket.get('logging')) \
            else False
    issues = list(filter(bucket_conditions, buckets))

    if (issues):
        print('Issues found with the following buckets:')

        output = StringIO()
        headers = ['name','region','stack','access','logging','versioning']
        writer = csv.DictWriter(output, fieldnames=headers)
        writer.writeheader()

        writer.writerows(issues)

        print(output.getvalue())
    else:
        print('All buckets are good.')
