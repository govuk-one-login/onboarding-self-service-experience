export const TEST_DYNAMO_TABLE_NAME = "TEST_TABLE_NAME";
export const TEST_STATE_MACHINE_ARN = "arn:aws:eu-west-2:stateMachine:123456";
process.env.TABLE = TEST_DYNAMO_TABLE_NAME;
process.env.STATE_MACHINE_ARN = TEST_STATE_MACHINE_ARN;
