import {toByteArray} from "base64-js";

const sendSmsMock = jest.fn();

const notifyClientMock = jest.fn().mockImplementation(() => {
    return {
        sendSms: sendSmsMock
    };
});
jest.mock("notifications-node-client", () => {
    return {NotifyClient: notifyClientMock};
});

const decryptMock = jest.fn().mockImplementation(() => {
    return {
        plaintext: "531836"
    };
});

const buildClientMock = jest.fn().mockImplementation(() => {
    return {
        decrypt: decryptMock
    };
});

jest.mock("@aws-crypto/client-node", () => {
    return {buildClient: buildClientMock, CommitmentPolicy: jest.fn(), KmsKeyringNode: jest.fn()};
});

process.env.SECURITY_CODE_TEXT_MESSAGE_TEMPLATE = "ac38449b-efba-4e05-911a-83648caa8de5";
process.env.KEY_ALIAS = "key-alias-01";

import {lambdaHandler} from "../../src/handlers/send-security-code-text-message";

describe("Custom SMS sender", () => {
    it("should send sms for valid trigger", () => {
        lambdaHandler({
            triggerSource: "CustomSMSSender_VerifyUserAttribute",
            request: {
                type: "",
                code: "gtrsdwjstae4",
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
        }).then(() => {
            expect(sendSmsMock).toBeCalledTimes(1);
            expect(sendSmsMock.mock.calls[0][0]).toBe("ac38449b-efba-4e05-911a-83648caa8de5");
            expect(sendSmsMock.mock.calls[0][1]).toBe("084168511");
            expect(sendSmsMock.mock.calls[0][2]).toEqual({
                personalisation: {code: "531836"},
                reference: null
            });
            expect(decryptMock).toBeCalledTimes(1);
            expect(decryptMock.mock.calls[0][1]).toEqual(toByteArray("gtrsdwjstae4"));
        });
    });

    it("should throw an error for missing code", () => {
        lambdaHandler({
            triggerSource: "CustomSMSSender_VerifyUserAttribute",
            request: {
                type: "",
                code: null,
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
        }).catch((reason: Error) => {
            expect(reason.message).toBe("Missing code parameter");
        });
    });
});
