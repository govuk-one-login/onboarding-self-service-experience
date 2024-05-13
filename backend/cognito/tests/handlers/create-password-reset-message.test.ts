import {generateEmailBody, handler} from "../../src/handlers/create-password-reset-message";
import {TEST_CODE_PARAM, TEST_EMAIL, TEST_HOST, TEST_PROTOCOL, mockCustomPasswordResetMessage} from "../mocks";

describe("create-password-reset-message handler tests", () => {
    it("throws an error for missing client metadata", async () => {
        await expect(
            handler({
                ...mockCustomPasswordResetMessage,
                request: {
                    ...mockCustomPasswordResetMessage.request,
                    clientMetadata: undefined
                }
            })
        ).rejects.toThrow("Client metadata is missing from the event");
    });

    it("updates the event.response field with the password reset email", async () => {
        const expectedResetLink = `${TEST_PROTOCOL}://${TEST_HOST}/sign-in/forgot-password/create-new-password?loginName=${TEST_EMAIL}&confirmationCode=${TEST_CODE_PARAM}`;
        const handlerResponse = await handler(mockCustomPasswordResetMessage);
        expect(handlerResponse.response).toStrictEqual({
            smsMessage: "",
            emailSubject: "Reset your password for GOV.UK One Login",
            emailMessage: generateEmailBody(expectedResetLink)
        });
    });
});
