const {sendSms, decrypt} = vi.hoisted(() => ({
    sendSms: vi.fn(),
    decrypt: vi.fn().mockImplementation(() => {
        return {
            plaintext: "531836"
        };
    })
}));

vi.mock("notifications-node-client", () => {
    return {
        NotifyClient: vi.fn(function () {
            return {sendSms: sendSms};
        })
    };
});

vi.mock("@aws-crypto/client-node", () => {
    return {
        CommitmentPolicy: vi.fn(),
        KmsKeyringNode: vi.fn(),
        buildClient: vi.fn(() => {
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
import {mockLambdaContext, smsSenderTrigger} from "../mocks.js";

describe("Custom SMS sender", () => {
    beforeEach(async () => {
        vi.clearAllMocks();
    });

    it("Send SMS with a security code", async () => {
        const {lambdaHandler} = await import("../../src/handlers/send-security-code-text-message.js");

        await lambdaHandler(smsSenderTrigger(phoneNumber, encryptedCode), mockLambdaContext);

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
        const {lambdaHandler} = await import("../../src/handlers/send-security-code-text-message.js");
        
        await expect(lambdaHandler(smsSenderTrigger(phoneNumber), mockLambdaContext)).rejects.toThrow(/missing.*code/i);
    });
});
