import {Context, CustomMessageForgotPasswordTriggerEvent, CustomSMSSenderTriggerEvent} from "aws-lambda";

export const smsSenderTrigger = (number: string, code?: string) =>
    ({request: {code: code, userAttributes: {phone_number: number}}} as unknown as CustomSMSSenderTriggerEvent);

export const mockLambdaContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "someFunction",
    functionVersion: "someVersion",
    invokedFunctionArn: "someFunctionArn",
    memoryLimitInMB: "1",
    awsRequestId: "someRequestId",
    logGroupName: "someLogGroupName",
    logStreamName: "someLogStreamName",
    getRemainingTimeInMillis: () => 1,
    done: jest.fn(),
    fail: jest.fn(),
    succeed: jest.fn()
};

export const TEST_PROTOCOL = "https";
export const TEST_HOST = "some.service.gov.uk";
export const TEST_CODE_PARAM = "12345";
export const TEST_EMAIL = "someEmail";
export const mockCustomPasswordResetMessage: CustomMessageForgotPasswordTriggerEvent = {
    request: {
        userAttributes: {},
        codeParameter: TEST_CODE_PARAM,
        linkParameter: "someLinkParam",
        usernameParameter: null,
        clientMetadata: {
            protocol: TEST_PROTOCOL,
            host: TEST_HOST,
            use_recovered_account_url: "null",
            username: TEST_EMAIL
        }
    },
    response: {
        emailMessage: null,
        emailSubject: null,
        smsMessage: null
    },
    version: "",
    region: "",
    userPoolId: "",
    triggerSource: "CustomMessage_ForgotPassword",
    userName: "",
    callerContext: {awsSdkVersion: "1.0", clientId: "someClientID"}
};
