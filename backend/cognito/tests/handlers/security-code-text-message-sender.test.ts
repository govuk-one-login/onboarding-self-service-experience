const sendSmsMock = jest.fn();

const notifyClientMock = jest.fn().mockImplementation(() => {
    return {
        sendSms: sendSmsMock
    };
});
jest.mock("notifications-node-client", () => {
    return {NotifyClient: notifyClientMock};
});
process.env.SECURITY_CODE_TEXT_MESSAGE_TEMPLATE = "ac38449b-efba-4e05-911a-83648caa8de5";

import {lambdaHandler} from "../../src/handlers/security-code-text-message-sender";

describe("Custom SMS sender", () => {
    it("should send sms for valid trigger", () => {
        lambdaHandler({
            triggerSource: "CustomSMSSender_VerifyUserAttribute",
            request: {
                type: "",
                code: "531836",
                userAttributes: {
                    phone_number: "084168511"
                }
            },
            version: "1",
            region: "",
            userPoolId: "id-1",
            userName: "",
            callerContext: {awsSdkVersion: "", clientId: ""},
            response: ""
        });
        expect(sendSmsMock).toBeCalledTimes(1);
        expect(sendSmsMock.mock.calls[0][0]).toBe("ac38449b-efba-4e05-911a-83648caa8de5");
        expect(sendSmsMock.mock.calls[0][1]).toBe("084168511");
        expect(sendSmsMock.mock.calls[0][2]).toEqual({
            personalisation: {code: "531836"},
            reference: null
        });
    });
});
