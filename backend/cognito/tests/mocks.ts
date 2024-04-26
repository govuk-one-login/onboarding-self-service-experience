import {CustomMessageForgotPasswordTriggerEvent, CustomSMSSenderTriggerEvent} from "aws-lambda";

export const smsSenderTrigger = (number: string, code?: string) =>
    ({request: {code: code, userAttributes: {phone_number: number}}} as unknown as CustomSMSSenderTriggerEvent);

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
