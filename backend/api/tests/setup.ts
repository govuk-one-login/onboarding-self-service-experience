export const TEST_DYNAMO_TABLE_NAME = "TEST_TABLE_NAME";
export const TEST_SQS_QUEUE_URL = "https://sqs.eu-west-2.amazonaws.com/123456789012/QUEUE";
export const TEST_STATE_MACHINE_ARN = "arn:aws:eu-west-2:stateMachine:123456";

process.env.QUEUEURL = TEST_SQS_QUEUE_URL;
process.env.TABLE = TEST_DYNAMO_TABLE_NAME;
process.env.STATE_MACHINE_ARN = TEST_STATE_MACHINE_ARN;
