import SelfServiceServicesService from "../../src/services/self-service-services-service";
import {request, response} from "../mocks";
import {
    TEST_AUTHENTICATION_RESULT,
    TEST_COGNITO_ID,
    TEST_CURRENT_PASSWORD,
    TEST_EMAIL,
    TEST_IP_ADDRESS,
    TEST_NEW_PASSWORD,
    TEST_PHONE_NUMBER,
    TEST_SECURITY_CODE,
    TEST_SESSION_ID,
    TEST_TIMESTAMP,
    TEST_USER
} from "../constants";
import {
    changePassword,
    processChangePhoneNumberForm,
    showAccount,
    showVerifyMobileWithSmsCode,
    verifyMobileWithSmsCode
} from "../../src/controllers/account";
import AuthenticationResultParser from "../../src/lib/authentication-result-parser";
import {
    CodeMismatchException,
    CognitoIdentityProviderServiceException,
    LimitExceededException,
    NotAuthorizedException
} from "@aws-sdk/client-cognito-identity-provider";

describe("showAccount controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });
    const getSelfServiceUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "getSelfServiceUser");
    const authenticationResultParserSpy = jest.spyOn(AuthenticationResultParser, "getPhoneNumber");

    it("calls s4 to retrieve the user details and renders the account template", async () => {
        getSelfServiceUserSpy.mockResolvedValue(TEST_USER);
        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        authenticationResultParserSpy.mockReturnValue(TEST_PHONE_NUMBER);
        const mockRes = response();
        const mockNext = jest.fn();

        await showAccount(mockReq, mockRes, mockNext);
        expect(getSelfServiceUserSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(mockRes.render).toHaveBeenCalledWith("account/account.njk", {
            emailAddress: TEST_USER.email,
            mobilePhoneNumber: TEST_USER.mobileNumber,
            passwordLastChanged: "Last updated just now",
            serviceName: "My juggling service",
            updatedField: undefined
        });
    });
});

describe("changePassword controller tests", () => {
    const s4ChangePasswordSpy = jest.spyOn(SelfServiceServicesService.prototype, "changePassword");
    const s4UpdateUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateUser");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");
    const authenticationResultParserSpy = jest.spyOn(AuthenticationResultParser, "getCognitoId");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("calls s4 change the user password and updates the password updated date, sends a TxMA log and then redirects to /account ", async () => {
        s4ChangePasswordSpy.mockResolvedValue();
        s4UpdateUserSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();
        authenticationResultParserSpy.mockReturnValue(TEST_COGNITO_ID);
        const mockReq = request({
            body: {
                newPassword: TEST_NEW_PASSWORD,
                currentPassword: TEST_CURRENT_PASSWORD
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await changePassword(mockReq, mockRes, mockNext);
        expect(s4ChangePasswordSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken, TEST_CURRENT_PASSWORD, TEST_NEW_PASSWORD);
        expect(s4UpdateUserSpy).toHaveBeenCalledWith(
            TEST_COGNITO_ID,
            {
                password_last_updated: new Date(TEST_TIMESTAMP)
            },
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith("SSE_UPDATE_PASSWORD", {
            session_id: TEST_SESSION_ID,
            user_id: TEST_COGNITO_ID,
            ip_address: TEST_IP_ADDRESS
        });
        expect(mockReq.session.updatedField).toStrictEqual("password");
        expect(mockRes.redirect).toHaveBeenCalledWith("/account");
    });

    it("renders the change password page with a too many attempts message when s4 throws a LimitExceededException", async () => {
        s4ChangePasswordSpy.mockRejectedValue(
            new LimitExceededException({
                message: "Too many attempts",
                $metadata: {}
            })
        );
        authenticationResultParserSpy.mockReturnValue(TEST_COGNITO_ID);
        const mockReq = request({
            body: {
                newPassword: TEST_NEW_PASSWORD,
                currentPassword: TEST_CURRENT_PASSWORD
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await changePassword(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("account/change-password.njk", {
            values: {
                newPassword: TEST_NEW_PASSWORD,
                currentPassword: TEST_CURRENT_PASSWORD
            },
            errorMessages: {
                newPassword: "You have tried to change your password too many times. Try again in 15 minutes."
            }
        });
    });

    it("renders the change password page with an Incorrect password error message when s4 throws a NotAuthorizedException", async () => {
        s4ChangePasswordSpy.mockRejectedValue(
            new NotAuthorizedException({
                message: "Wrong Password",
                $metadata: {}
            })
        );
        authenticationResultParserSpy.mockReturnValue(TEST_COGNITO_ID);
        const mockReq = request({
            body: {
                newPassword: TEST_NEW_PASSWORD,
                currentPassword: TEST_CURRENT_PASSWORD
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await changePassword(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("account/change-password.njk", {
            values: {
                newPassword: TEST_NEW_PASSWORD
            },
            errorMessages: {
                newPassword: "Your current password is incorrect"
            }
        });
    });

    it("throws the error when it is any other kind of CognitoIdentityProviderServiceException", async () => {
        s4ChangePasswordSpy.mockRejectedValue(
            new CognitoIdentityProviderServiceException({
                $fault: "server",
                name: "someOtherException",
                $metadata: {httpStatusCode: 500}
            })
        );
        authenticationResultParserSpy.mockReturnValue(TEST_COGNITO_ID);
        const mockReq = request({
            body: {
                newPassword: TEST_NEW_PASSWORD,
                currentPassword: TEST_CURRENT_PASSWORD
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await expect(() => changePassword(mockReq, mockRes, mockNext)).rejects.toThrow(CognitoIdentityProviderServiceException);
    });

    it("throws the error when it is not a  CognitoIdentityProviderServiceException", async () => {
        const error = "someError";
        s4ChangePasswordSpy.mockRejectedValue(new Error(error));
        authenticationResultParserSpy.mockReturnValue(TEST_COGNITO_ID);
        const mockReq = request({
            body: {
                newPassword: TEST_NEW_PASSWORD,
                currentPassword: TEST_CURRENT_PASSWORD
            },
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await expect(() => changePassword(mockReq, mockRes, mockNext)).rejects.toThrow(error);
    });
});

describe("processChangeNumberForm", () => {
    const s4SetPhoneNumberSpy = jest.spyOn(SelfServiceServicesService.prototype, "setPhoneNumber");
    const s4UpdateUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateUser");
    const s4SendVerificationCodeSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendMobileNumberVerificationCode");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");
    const authenticationResultParserEmailSpy = jest.spyOn(AuthenticationResultParser, "getEmail");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the s4 service with the expected parameters and renders the enter text code page", async () => {
        authenticationResultParserEmailSpy.mockReturnValue(TEST_EMAIL);
        s4SetPhoneNumberSpy.mockResolvedValue();
        s4UpdateUserSpy.mockResolvedValue();
        s4SendVerificationCodeSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            body: {
                mobileNumber: TEST_PHONE_NUMBER
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processChangePhoneNumberForm(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/account/change-phone-number/enter-text-code");
    });
});

describe("showVerifyMobileWithSmsCode controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls res.render with the expected values", () => {
        const mockReq = request({session: {enteredMobileNumber: TEST_PHONE_NUMBER}});
        const mockRes = response();
        const mockNext = jest.fn();

        showVerifyMobileWithSmsCode(mockReq, mockRes, mockNext);

        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            headerActiveItem: "your-account",
            values: {
                mobileNumber: TEST_PHONE_NUMBER,
                textMessageNotReceivedUrl: "/account/change-phone-number/resend-text-code"
            }
        });
    });
});

describe("verifyMobileWithSmsCode controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");
    const s4VerifyMobileSpy = jest.spyOn(SelfServiceServicesService.prototype, "verifyMobileUsingSmsCode");
    const s4SetMobilePhoneAsVerifiedSpy = jest.spyOn(SelfServiceServicesService.prototype, "setMobilePhoneAsVerified");
    const authenticationResultParserEmailSpy = jest.spyOn(AuthenticationResultParser, "getEmail");
    const authenticationResultParserGetCognitoSpy = jest.spyOn(AuthenticationResultParser, "getCognitoId");

    it("renders the enter text code page with an error message  upon a CodeMismatchException", async () => {
        s4VerifyMobileSpy.mockRejectedValue(
            new CodeMismatchException({
                message: "Incorrect Code",
                $metadata: {httpStatusCode: 400}
            })
        );
        authenticationResultParserEmailSpy.mockReturnValue(TEST_EMAIL);
        authenticationResultParserGetCognitoSpy.mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID,
                enteredMobileNumber: TEST_PHONE_NUMBER
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await verifyMobileWithSmsCode(mockReq, mockRes, mockNext);

        expect(s4VerifyMobileSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken, TEST_SECURITY_CODE, TEST_EMAIL);
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_PHONE_VERIFICATION_COMPLETE",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID,
                phone: TEST_PHONE_NUMBER
            },
            {
                outcome: "failed"
            }
        );
        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            headerActiveItem: "your-account",
            values: {
                securityCode: TEST_SECURITY_CODE,
                mobileNumber: TEST_PHONE_NUMBER,
                textMessageNotReceivedUrl: "/account/change-phone-number/resend-text-code"
            },
            errorMessages: {
                securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
            }
        });
    });

    it("redirects to /account upon a successful text code verification", async () => {
        s4VerifyMobileSpy.mockResolvedValue();
        s4SetMobilePhoneAsVerifiedSpy.mockResolvedValue();
        authenticationResultParserEmailSpy.mockReturnValue(TEST_EMAIL);
        authenticationResultParserGetCognitoSpy.mockReturnValue(TEST_COGNITO_ID);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID,
                enteredMobileNumber: TEST_PHONE_NUMBER
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await verifyMobileWithSmsCode(mockReq, mockRes, mockNext);

        expect(s4VerifyMobileSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken, TEST_SECURITY_CODE, TEST_EMAIL);
        expect(s4SetMobilePhoneAsVerifiedSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockReq.session.mobileNumber).toStrictEqual(TEST_PHONE_NUMBER);
        expect(mockReq.session.updatedField).toStrictEqual("mobile phone number");
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_PHONE_VERIFICATION_COMPLETE",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID,
                phone: TEST_PHONE_NUMBER
            },
            {
                outcome: "success"
            }
        );
        expect(mockRes.redirect).toHaveBeenCalledWith("/account");
    });
});
