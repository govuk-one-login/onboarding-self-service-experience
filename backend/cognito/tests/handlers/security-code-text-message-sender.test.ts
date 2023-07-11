const sendSms = jest.fn();
const decrypt = jest.fn().mockImplementation(() => {
    return {
        plaintext: "531836"
    };
});

jest.mock("notifications-node-client", () => {
    return {
        NotifyClient: jest.fn(() => {
            return {sendSms: sendSms};
        })
    };
});

jest.mock("@aws-crypto/client-node", () => {
    return {
        CommitmentPolicy: jest.fn(),
        KmsKeyringNode: jest.fn(),
        buildClient: jest.fn(() => {
            return {
                decrypt: decrypt
            };
        })
    };
});

const encryptedCode = "gtrsdwjstae4";
const phoneNumber = "084168511";
const templateId = "template-id";

process.env.SECURITY_CODE_TEXT_MESSAGE_TEMPLATE = templateId;

import {toByteArray} from "base64-js";
import {lambdaHandler} from "handlers/send-security-code-text-message";
import {smsSenderTrigger} from "../mocks";

describe("Custom SMS sender", () => {
    it("Send SMS with a security code", async () => {
        await lambdaHandler(smsSenderTrigger(phoneNumber, encryptedCode));

        expect(sendSms).toBeCalledTimes(1);
        expect(sendSms.mock.calls[0][0]).toBe(templateId);
        expect(sendSms.mock.calls[0][1]).toBe(phoneNumber);
        expect(sendSms.mock.calls[0][2]).toEqual({
            personalisation: {code: "531836"},
            reference: null
        });

        expect(decrypt).toBeCalledTimes(1);
        expect(decrypt.mock.calls[0][1]).toEqual(toByteArray(encryptedCode));
    });

    it("Throw an error for missing code", async () => {
        await expect(lambdaHandler(smsSenderTrigger(phoneNumber))).rejects.toThrow(/missing.*code/i);
    });
});
