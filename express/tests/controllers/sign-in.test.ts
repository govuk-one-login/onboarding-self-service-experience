import {request, response} from "../mocks";
import {
    confirmForgotPassword,
    confirmForgotPasswordForm,
    confirmPasswordContinueRecovery,
    finishSignIn,
    forgotPasswordForm,
    globalSignOut,
    organiseDynamoDBForRecoveredUser,
    processEmailAddress,
    showCheckPhonePage,
    checkEmailPasswordReset
} from "../../src/controllers/sign-in";
import {
    TEST_AUTHENTICATION_RESULT,
    TEST_COGNITO_ID,
    TEST_CURRENT_PASSWORD,
    TEST_DYNAMO_USER,
    TEST_EMAIL,
    TEST_FULL_NAME,
    TEST_HOST_NAME,
    TEST_IP_ADDRESS,
    TEST_MFA_RESPONSE,
    TEST_PHONE_NUMBER,
    TEST_PROTOCOL,
    TEST_RANDOM_NUMBER,
    TEST_SECURITY_CODE,
    TEST_SESSION_ID,
    TEST_TIMESTAMP,
    TEST_USER
} from "../constants";
import {obscureNumber} from "../../src/lib/mobile-number";
import SelfServiceServicesService from "../../src/services/self-service-services-service";
import {User} from "../../@types/user";
import AuthenticationResultParser from "../../src/lib/authentication-result-parser";
import {AxiosResponse} from "axios";
import {SignupStatus, SignupStatusStage} from "../../src/lib/utils/signup-status";
import console from "console";
import {LimitExceededException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import crypto from "node:crypto";

jest.spyOn(crypto, "randomInt").mockImplementation(() => TEST_RANDOM_NUMBER);

describe("showCheckPhonePage controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });
    it.each(["emailAddress", "mfaResponse"])("redirects to the /sign-in page if the %s session value in session is null", field => {
        const mockReq = request({
            session: {
                [field]: null
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        showCheckPhonePage(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-email-address");
    });

    it("calls render with the enter text code template and expected render options", () => {
        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                mfaResponse: TEST_MFA_RESPONSE
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        showCheckPhonePage(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            headerActiveItem: "sign-in",
            values: {
                mobileNumber: obscureNumber(TEST_PHONE_NUMBER),
                textMessageNotReceivedUrl: "/sign-in/resend-text-code"
            }
        });
    });
});

describe("confirmPasswordContinueRecovery controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls render with the expected template path", () => {
        const mockReq = response();
        confirmPasswordContinueRecovery(request(), mockReq, jest.fn());
        expect(mockReq.redirect).toHaveBeenCalledWith("/sign-in/forgot-password/continue-recovery");
    });
});

describe("finishSignIn controller tests", () => {
    const s4GetSelfServiceUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "getSelfServiceUser");
    const s4UpdateUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateUser");
    const getCognitoSpy = jest.spyOn(AuthenticationResultParser, "getCognitoId");
    const s4SessionCount = jest.spyOn(SelfServiceServicesService.prototype, "sessionCount");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("redirects to /sign-in/enter-text-code if s4 does not return a user", async () => {
        s4GetSelfServiceUserSpy.mockResolvedValue(null as unknown as User);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await finishSignIn(mockReq, mockRes, mockNext);
        expect(s4GetSelfServiceUserSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-text-code");
    });

    it("calls s4 updateUser if the session updatedField is password", async () => {
        s4GetSelfServiceUserSpy.mockResolvedValue(TEST_USER);
        s4UpdateUserSpy.mockResolvedValue();
        getCognitoSpy.mockReturnValue(TEST_COGNITO_ID);
        s4SessionCount.mockResolvedValue(1);
        s4SendTxMALogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                updatedField: "password"
            }
        });

        const mockRes = response();
        const mockNext = jest.fn();

        await finishSignIn(mockReq, mockRes, mockNext);

        expect(s4GetSelfServiceUserSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(s4UpdateUserSpy).toHaveBeenCalledWith(
            TEST_COGNITO_ID,
            {password_last_updated: new Date(TEST_TIMESTAMP)},
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
    });

    it("redirects to /sign-in/signed-in-to-another-device if the session count is > 1", async () => {
        s4GetSelfServiceUserSpy.mockResolvedValue(TEST_USER);
        s4UpdateUserSpy.mockResolvedValue();
        s4SessionCount.mockResolvedValue(3);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            }
        });

        const mockRes = response();
        const mockNext = jest.fn();

        await finishSignIn(mockReq, mockRes, mockNext);

        expect(s4GetSelfServiceUserSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(s4UpdateUserSpy).not.toHaveBeenCalled();
        expect(mockReq.session.isSignedIn).toBe(true);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/signed-in-to-another-device");
    });

    it("sends two txma logs and redirects to /services when the session count is 1", async () => {
        s4GetSelfServiceUserSpy.mockResolvedValue(TEST_USER);
        s4UpdateUserSpy.mockResolvedValue();
        s4SessionCount.mockResolvedValue(1);
        getCognitoSpy.mockReturnValue(TEST_COGNITO_ID);
        s4SendTxMALogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });

        const mockRes = response();
        const mockNext = jest.fn();

        await finishSignIn(mockReq, mockRes, mockNext);

        expect(s4GetSelfServiceUserSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(s4UpdateUserSpy).not.toHaveBeenCalled();
        expect(mockReq.session.isSignedIn).toBe(true);
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith("SSE_LOG_IN_SUCCESS", {
            session_id: TEST_SESSION_ID,
            ip_address: TEST_IP_ADDRESS,
            user_id: TEST_COGNITO_ID,
            email: TEST_EMAIL
        });
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_PHONE_VERIFICATION_COMPLETE",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID,
                email: TEST_EMAIL
            },
            {
                outcome: "success"
            }
        );
        expect(mockRes.redirect).toHaveBeenCalledWith("/services");
    });
});

describe("globalSignOut controller tests", () => {
    const s4GetSelfServiceUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "getSelfServiceUser");
    const s4GlobalSignOutSpy = jest.spyOn(SelfServiceServicesService.prototype, "globalSignOut");

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("calls s4 for user and global sign out if access token is present and then destroys the session", async () => {
        s4GetSelfServiceUserSpy.mockResolvedValue(TEST_USER);
        s4GlobalSignOutSpy.mockResolvedValue({status: 200} as AxiosResponse);

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                destroy: jest.fn().mockImplementation(arg => arg())
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await globalSignOut(mockReq, mockRes, mockNext);
        expect(s4GetSelfServiceUserSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT);
        expect(s4GlobalSignOutSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockReq.session.destroy).toHaveBeenCalledWith(expect.any(Function));
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-email-address-global-sign-out");
    });

    it("calls only destroy session if there is no access token present", async () => {
        const mockRes = response();
        const mockReq = request({
            session: {
                authenticationResult: {...TEST_AUTHENTICATION_RESULT, AccessToken: null},
                destroy: jest.fn().mockImplementation(arg => arg())
            }
        });
        const mockNext = jest.fn();

        await globalSignOut(mockReq, mockRes, mockNext);
        expect(s4GetSelfServiceUserSpy).not.toHaveBeenCalled();
        expect(s4GlobalSignOutSpy).not.toHaveBeenCalled();
        expect(mockReq.session.destroy).toHaveBeenCalledWith(expect.any(Function));
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-email-address-global-sign-out");
    });
});

describe("processEmailAddress controller tests", () => {
    const s4GetSignUpStatusSpy = jest.spyOn(SelfServiceServicesService.prototype, "getSignUpStatus");

    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "info");
    });

    it("calls s4 get to get the sign up status and redirects to /register/resume-before-password if there is no email", async () => {
        s4GetSignUpStatusSpy.mockResolvedValue(new SignupStatus());

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processEmailAddress(mockReq, mockRes, mockNext);

        expect(s4GetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("Processing No HasEmail");
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-before-password");
    });

    it("calls s4 get to get the sign up status and redirects to /register/resume-before-password if the password stage hasn't been reached", async () => {
        const mockSignUpStatus = new SignupStatus();
        mockSignUpStatus.setStage(SignupStatusStage.HasEmail, true);
        s4GetSignUpStatusSpy.mockResolvedValue(mockSignUpStatus);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processEmailAddress(mockReq, mockRes, mockNext);

        expect(s4GetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("Processing No HasPassword");
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-before-password");
    });

    it("calls s4 get to get the sign up status and redirects to /register/resume-after-password if there is no phone number", async () => {
        const mockSignUpStatus = new SignupStatus();
        mockSignUpStatus.setStage(SignupStatusStage.HasEmail, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPassword, true);
        s4GetSignUpStatusSpy.mockResolvedValue(mockSignUpStatus);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processEmailAddress(mockReq, mockRes, mockNext);

        expect(s4GetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("Processing No HasPhoneNumber");
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-after-password");
    });

    it("calls s4 get to get the sign up status and redirects to /register/resume-after-password if there is no text code", async () => {
        const mockSignUpStatus = new SignupStatus();
        mockSignUpStatus.setStage(SignupStatusStage.HasEmail, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPassword, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPhoneNumber, true);
        s4GetSignUpStatusSpy.mockResolvedValue(mockSignUpStatus);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processEmailAddress(mockReq, mockRes, mockNext);

        expect(s4GetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("Processing No HasTextCode");
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-after-password");
    });

    it("calls s4 get to get the sign up status and redirects to /sign-in/enter-password if all stages are present", async () => {
        const mockSignUpStatus = new SignupStatus();
        mockSignUpStatus.setStage(SignupStatusStage.HasEmail, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPassword, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPhoneNumber, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasTextCode, true);
        s4GetSignUpStatusSpy.mockResolvedValue(mockSignUpStatus);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processEmailAddress(mockReq, mockRes, mockNext);

        expect(s4GetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-password");
    });

    it("redirects to /sign-in/enter-password if s4 throws an error", async () => {
        s4GetSignUpStatusSpy.mockRejectedValue(new Error("someError"));

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processEmailAddress(mockReq, mockRes, mockNext);

        expect(s4GetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-password");
    });
});

describe("forgotPasswordForm controller tests", () => {
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("sends a txma log and renders the /sign-in/forgot-password template with the email address in the options", async () => {
        s4SendTxMALogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await forgotPasswordForm(mockReq, mockRes, mockNext);

        expect(s4SendTxMALogSpy).toHaveBeenCalledWith("SSE_PASSWORD_RESET_REQUESTED", {
            email: TEST_EMAIL,
            session_id: TEST_SESSION_ID,
            ip_address: TEST_IP_ADDRESS
        });
        expect(mockRes.render).toHaveBeenCalledWith("sign-in/forgot-password.njk", {
            values: {
                emailAddress: TEST_EMAIL
            }
        });
    });
});

describe("confirmForgotPasswordForm controller tests", () => {
    it("renders the /sign-in/create-new-password template with the expected values", () => {
        const mockReq = request({
            query: {
                loginName: TEST_FULL_NAME,
                confirmationCode: TEST_SECURITY_CODE
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        confirmForgotPasswordForm(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("sign-in/create-new-password.njk", {
            loginName: TEST_FULL_NAME,
            confirmationCode: TEST_SECURITY_CODE
        });
    });
});

describe("confirmForgotPassword controller tests", () => {
    const s4ConfirmForgotPasswordSpy = jest.spyOn(SelfServiceServicesService.prototype, "confirmForgotPassword");
    const s4SendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

    beforeEach(() => {
        jest.clearAllMocks();
    });
    it("handles a LimitExceededException and renders the /sign-in/create-new-password template with an error message", async () => {
        s4ConfirmForgotPasswordSpy.mockRejectedValue(
            new LimitExceededException({
                $metadata: {httpStatusCode: 400},
                message: "Too Many requests"
            })
        );

        const mockReq = request({
            body: {
                loginName: TEST_EMAIL,
                password: TEST_CURRENT_PASSWORD,
                confirmationCode: TEST_SECURITY_CODE
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await confirmForgotPassword(mockReq, mockRes, mockNext);
        expect(s4ConfirmForgotPasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_CURRENT_PASSWORD, TEST_SECURITY_CODE);
        expect(mockRes.render).toHaveBeenCalledWith("sign-in/create-new-password.njk", {
            errorMessages: {
                password: "You have tried to change your password too many times. Try again in 15 minutes."
            },
            values: {
                password: TEST_CURRENT_PASSWORD
            }
        });
    });

    it("throws any s4 errors which are not LimitExceededException", async () => {
        s4ConfirmForgotPasswordSpy.mockRejectedValue(new Error("someError"));

        const mockReq = request({
            body: {
                loginName: TEST_EMAIL,
                password: TEST_CURRENT_PASSWORD,
                confirmationCode: TEST_SECURITY_CODE
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await expect(confirmForgotPassword(mockReq, mockRes, mockNext)).rejects.toThrow();
        expect(s4ConfirmForgotPasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_CURRENT_PASSWORD, TEST_SECURITY_CODE);
        expect(mockRes.render).not.toHaveBeenCalled();
    });

    it("sends a txma log and calls next() when the confirm password forgot call is successful", async () => {
        s4ConfirmForgotPasswordSpy.mockResolvedValue();
        s4SendTxMALogSpy.mockReturnValue();

        const mockReq = request({
            body: {
                loginName: TEST_EMAIL,
                password: TEST_CURRENT_PASSWORD,
                confirmationCode: TEST_SECURITY_CODE
            },
            session: {
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await confirmForgotPassword(mockReq, mockRes, mockNext);
        expect(mockReq.session.emailAddress).toStrictEqual(TEST_EMAIL);
        expect(mockReq.session.updatedField).toStrictEqual("password");
        expect(s4SendTxMALogSpy).toHaveBeenCalledWith("SSE_PASSWORD_RESET_COMPLETED", {
            email: TEST_EMAIL,
            session_id: TEST_SESSION_ID,
            ip_address: TEST_IP_ADDRESS
        });
        expect(mockNext).toHaveBeenCalled();
    });
});

describe("organiseDynamoDBForRecoveredUser controller tests", () => {
    const s4RecreateDynamoDBAccountLinksSpy = jest.spyOn(SelfServiceServicesService.prototype, "recreateDynamoDBAccountLinks");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 recreateDynamoDBAccountLinks with the expected values and then calls next()", async () => {
        s4RecreateDynamoDBAccountLinksSpy.mockResolvedValue();
        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                cognitoID: TEST_COGNITO_ID
            }
        });
        const mockNext = jest.fn();
        await organiseDynamoDBForRecoveredUser(mockReq, response(), mockNext);
        expect(s4RecreateDynamoDBAccountLinksSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT, TEST_COGNITO_ID);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe("checkEmailPasswordReset controller tests", () => {
    const s4ForgotPasswordSpy = jest.spyOn(SelfServiceServicesService.prototype, "forgotPassword");
    const s4GetDynamoDbEntriesSpy = jest.spyOn(SelfServiceServicesService.prototype, "getDynamoDBEntries");
    const s4RecoverCognitoSpy = jest.spyOn(SelfServiceServicesService.prototype, "recoverCognitoAccount");

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 forgotPassword and calls render with the /sign-in/enter-email-code template", async () => {
        s4ForgotPasswordSpy.mockResolvedValue();
        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            },
            hostname: TEST_HOST_NAME,
            protocol: TEST_PROTOCOL
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await checkEmailPasswordReset(mockReq, mockRes, mockNext);
        expect(s4ForgotPasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, false);
        expect(mockRes.render).toHaveBeenCalledWith("sign-in/enter-email-code.njk");
    });

    it("calls s4 forgotPassword and handles a UserNotFoundException", async () => {
        s4ForgotPasswordSpy.mockRejectedValueOnce(
            new UserNotFoundException({
                $metadata: {httpStatusCode: 400},
                message: "User not found"
            })
        );
        s4GetDynamoDbEntriesSpy.mockResolvedValue({data: TEST_DYNAMO_USER} as AxiosResponse);
        s4RecoverCognitoSpy.mockResolvedValue();

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            },
            hostname: TEST_HOST_NAME,
            protocol: TEST_PROTOCOL
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await checkEmailPasswordReset(mockReq, mockRes, mockNext);
        expect(s4ForgotPasswordSpy).toHaveBeenNthCalledWith(1, TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, false);
        expect(s4RecoverCognitoSpy).toHaveBeenCalledWith(mockReq, TEST_EMAIL, "123456", TEST_PHONE_NUMBER);
        expect(s4ForgotPasswordSpy).toHaveBeenNthCalledWith(2, TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, true);
        expect(mockRes.render).toHaveBeenCalledWith("sign-in/enter-email-code.njk");
    });

    it("calls s4 forgotPassword and handles a UserNotFoundException where no dynamo response is found", async () => {
        s4ForgotPasswordSpy.mockRejectedValueOnce(
            new UserNotFoundException({
                $metadata: {httpStatusCode: 400},
                message: "User not found"
            })
        );
        s4GetDynamoDbEntriesSpy.mockResolvedValue({data: undefined} as AxiosResponse);
        s4RecoverCognitoSpy.mockResolvedValue();

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            },
            hostname: TEST_HOST_NAME,
            protocol: TEST_PROTOCOL
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await checkEmailPasswordReset(mockReq, mockRes, mockNext);
        expect(s4ForgotPasswordSpy).toHaveBeenNthCalledWith(1, TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, false);
        expect(s4RecoverCognitoSpy).not.toHaveBeenCalled();
        expect(s4ForgotPasswordSpy).toHaveBeenCalledTimes(1);
        expect(mockReq.session.emailAddress).toStrictEqual(TEST_EMAIL);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/account-not-found");
    });

    it("calls s4 forgotPassword and handles a LimitExceededException", async () => {
        s4ForgotPasswordSpy.mockRejectedValueOnce(
            new LimitExceededException({
                $metadata: {httpStatusCode: 400},
                message: "Too many requests"
            })
        );

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            },
            hostname: TEST_HOST_NAME,
            protocol: TEST_PROTOCOL
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await checkEmailPasswordReset(mockReq, mockRes, mockNext);
        expect(s4ForgotPasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, false);
        expect(mockRes.render).toHaveBeenCalledWith("sign-in/enter-email-address.njk", {
            values: {
                emailAddress: TEST_EMAIL
            },
            errorMessages: {
                emailAddress: "You have tried to change your password too many times. Try again in 15 minutes."
            }
        });
    });
});
