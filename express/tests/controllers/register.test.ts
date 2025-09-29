import SelfServiceServicesService from "../../src/services/self-service-services-service";
import {
    accountExists,
    processAddServiceForm,
    processEnterMobileForm,
    processGetEmailForm,
    redirectToServicesList,
    resendEmailVerificationCode,
    resumeUserJourneyAfterPassword,
    sendDataToUserSpreadsheet,
    showCheckEmailForm,
    showEnterMobileForm,
    showNewPasswordForm,
    showResendEmailCodeForm,
    showSubmitMobileVerificationCode,
    submitEmailSecurityCode,
    submitMobileVerificationCode,
    updatePassword
} from "../../src/controllers/register";
import {request, response} from "../mocks";
import {
    TEST_ACCESS_TOKEN,
    TEST_AUTHENTICATION_RESULT,
    TEST_COGNITO_ID,
    TEST_COGNITO_SESSION_STRING,
    TEST_CURRENT_PASSWORD,
    TEST_EMAIL,
    TEST_IP_ADDRESS,
    TEST_PASSWORD,
    TEST_PHONE_NUMBER,
    TEST_SECURITY_CODE,
    TEST_SERVICE_ID,
    TEST_SERVICE_NAME,
    TEST_SESSION_ID,
    TEST_TIMESTAMP,
    TEST_UUID
} from "../constants";
import {CodeMismatchException, NotAuthorizedException, UsernameExistsException} from "@aws-sdk/client-cognito-identity-provider";
import console from "console";
import {SignupStatus, SignupStatusStage} from "../../src/lib/utils/signup-status";
import AuthenticationResultParser from "../../src/lib/authentication-result-parser";
import {domainUserToDynamoUser} from "../../src/lib/models/user-utils";
import crypto from "crypto";
import {AxiosResponse} from "axios";

const s4CreateUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "createUser");
const s4SignUpStatusSpy = jest.spyOn(SelfServiceServicesService.prototype, "getSignUpStatus");
const s4SubmitUsernamePasswordSpy = jest.spyOn(SelfServiceServicesService.prototype, "submitUsernamePassword");
const s4SetSignupStatusSpy = jest.spyOn(SelfServiceServicesService.prototype, "setSignUpStatus");
const s4SendTxmaLogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");
const s4SetNewPasswordSpy = jest.spyOn(SelfServiceServicesService.prototype, "setNewPassword");
const s4SetEmailAsVerifiedSpy = jest.spyOn(SelfServiceServicesService.prototype, "setEmailAsVerified");
const s4SetSignUpStatusSpy = jest.spyOn(SelfServiceServicesService.prototype, "setSignUpStatus");
const s4SetPhoneNumberSpy = jest.spyOn(SelfServiceServicesService.prototype, "setPhoneNumber");
const s4SendMobileNumberVerificationCodeSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendMobileNumberVerificationCode");
const s4VerifyMobileUsingSmsCodeSpy = jest.spyOn(SelfServiceServicesService.prototype, "verifyMobileUsingSmsCode");
const s4SetMfaPreferenceSpy = jest.spyOn(SelfServiceServicesService.prototype, "setMfaPreference");
const s4PutUserSpy = jest.spyOn(SelfServiceServicesService.prototype, "putUser");
const s4NewServiceSpy = jest.spyOn(SelfServiceServicesService.prototype, "newService");
const s4GenerateClientSpy = jest.spyOn(SelfServiceServicesService.prototype, "generateClient");
const s4DeleteServiceEntriesSpy = jest.spyOn(SelfServiceServicesService.prototype, "deleteServiceEntries");
const s4ResendEmailCodeSpy = jest.spyOn(SelfServiceServicesService.prototype, "resendEmailAuthCode");
const s4updateUserSpreadsheetSpy = jest.spyOn(SelfServiceServicesService.prototype, "updateUserSpreadsheet");

const getEmailSpy = jest.spyOn(AuthenticationResultParser, "getEmail");
const getCognitoIdSpy = jest.spyOn(AuthenticationResultParser, "getCognitoId");

const getEmailCodeBlockSpy = jest.spyOn(SelfServiceServicesService.prototype, "getEmailCodeBlock");
const putEmailCodeBlockSpy = jest.spyOn(SelfServiceServicesService.prototype, "putEmailCodeBlock");
const removeEmailCodeBlockSpy = jest.spyOn(SelfServiceServicesService.prototype, "removeEmailCodeBlock");

describe("processGetEmailForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(console, "info");
    });

    it("calls s4 createUser and redirects to /register/enter-email-code on success", async () => {
        s4CreateUserSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processGetEmailForm(mockReq, mockRes, mockNext);
        expect(s4CreateUserSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockReq.session.save).toHaveBeenCalled();
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/enter-email-code");
    });

    it("calls s4 createUser handles a UsernameExistsException and redirects to resume-before-password when the signup status is at the no Email stage", async () => {
        s4CreateUserSpy.mockRejectedValue(
            new UsernameExistsException({
                $metadata: {httpStatusCode: 400},
                message: "Username exists"
            })
        );

        s4SignUpStatusSpy.mockResolvedValue(new SignupStatus());

        const mockReq = request({
            body: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processGetEmailForm(mockReq, mockRes, mockNext);
        expect(s4CreateUserSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(s4SignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockReq.session.save).toHaveBeenCalled();
        expect(console.info).toHaveBeenCalledWith("Processing No HasEmail");
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-before-password");
    });

    it("calls s4 createUser handles a UsernameExistsException and redirects to resume-before-password when the signup status is at the no password stage", async () => {
        s4CreateUserSpy.mockRejectedValue(
            new UsernameExistsException({
                $metadata: {httpStatusCode: 400},
                message: "Username exists"
            })
        );

        const mockSignUpStatus = new SignupStatus();
        mockSignUpStatus.setStage(SignupStatusStage.HasEmail, true);
        s4SignUpStatusSpy.mockResolvedValue(mockSignUpStatus);

        const mockReq = request({
            body: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processGetEmailForm(mockReq, mockRes, mockNext);
        expect(s4CreateUserSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(s4SignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("Processing No HasPassword");
        expect(mockReq.session.save).toHaveBeenCalled();
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-before-password");
    });

    it("calls s4 createUser handles a UsernameExistsException and redirects to resume-after-password when the signup status is at the no phone number stage", async () => {
        s4CreateUserSpy.mockRejectedValue(
            new UsernameExistsException({
                $metadata: {httpStatusCode: 400},
                message: "Username exists"
            })
        );

        const mockSignUpStatus = new SignupStatus();
        mockSignUpStatus.setStage(SignupStatusStage.HasEmail, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPassword, true);
        s4SignUpStatusSpy.mockResolvedValue(mockSignUpStatus);

        const mockReq = request({
            body: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processGetEmailForm(mockReq, mockRes, mockNext);
        expect(s4CreateUserSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(s4SignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("Processing No HasPhoneNumber");
        expect(mockReq.session.save).toHaveBeenCalled();
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-after-password");
    });

    it("calls s4 createUser handles a UsernameExistsException and redirects to resume-after-password when the signup status is at the no text code stage", async () => {
        s4CreateUserSpy.mockRejectedValue(
            new UsernameExistsException({
                $metadata: {httpStatusCode: 400},
                message: "Username exists"
            })
        );

        const mockSignUpStatus = new SignupStatus();
        mockSignUpStatus.setStage(SignupStatusStage.HasEmail, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPassword, true);
        mockSignUpStatus.setStage(SignupStatusStage.HasPhoneNumber, true);
        s4SignUpStatusSpy.mockResolvedValue(mockSignUpStatus);

        const mockReq = request({
            body: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processGetEmailForm(mockReq, mockRes, mockNext);
        expect(s4CreateUserSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(s4SignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockReq.session.save).toHaveBeenCalled();
        expect(console.info).toHaveBeenCalledWith("Processing No HasTextCode");
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/resume-after-password");
    });

    it("throws any non-UsernameExistsException errors", async () => {
        s4CreateUserSpy.mockRejectedValue(new Error("someError"));

        const mockReq = request({
            body: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await expect(processGetEmailForm(mockReq, mockRes, mockNext)).rejects.toThrow();
        expect(s4CreateUserSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockReq.session.save).toHaveBeenCalled();
        expect(s4SignUpStatusSpy).not.toHaveBeenCalled();
    });
});

describe("showCheckEmailForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the form with the expected options and sends a txma log", async () => {
        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await showCheckEmailForm(mockReq, mockRes, mockNext);

        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith("SSE_EMAIL_VERIFICATION_REQUEST", {
            session_id: TEST_SESSION_ID,
            ip_address: TEST_IP_ADDRESS,
            email: TEST_EMAIL
        });
        expect(mockRes.render).toHaveBeenCalledWith("register/enter-email-code.njk", {values: {emailAddress: TEST_EMAIL}});
    });

    it("redirects to /register if there is no emailAddress present in the session", async () => {
        const mockReq = request({
            session: {
                id: TEST_SESSION_ID
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await showCheckEmailForm(mockReq, mockRes, mockNext);
        expect(s4SendTxmaLogSpy).not.toHaveBeenCalled();
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/enter-email-address");
    });

    it("it renders an error page if the code request count in the session is higher than 6", async () => {
        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL,
                emailCodeSubmitCount: 10
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await showCheckEmailForm(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/too-many-codes");
    });

    it("it renders an error page if the user is code blocked for that email", async () => {
        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        getEmailCodeBlockSpy.mockResolvedValue(true);

        await showCheckEmailForm(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/too-many-codes");
    });
});

describe("submitEmailSecurityCode controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it("redirects to /register if there is no emailAddress in the session", async () => {
        const mockReq = request();
        const mockRes = response();
        const mockNext = jest.fn();

        await submitEmailSecurityCode(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/enter-email-address");
    });

    it("calls submitUserName password with the session email and security code, sets the signUp status and redirects to /register/create-password on success", async () => {
        s4SubmitUsernamePasswordSpy.mockResolvedValue({
            $metadata: {httpStatusCode: 200},
            Session: TEST_COGNITO_SESSION_STRING
        });
        s4SetSignupStatusSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await submitEmailSecurityCode(mockReq, mockRes, mockNext);
        expect(s4SubmitUsernamePasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_SECURITY_CODE);
        expect(mockReq.session.cognitoSession).toStrictEqual(TEST_COGNITO_SESSION_STRING);
        expect(s4SetSignupStatusSpy).toHaveBeenCalledWith(TEST_EMAIL, SignupStatusStage.HasEmail);
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_EMAIL_VERIFICATION_COMPLETE",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                email: TEST_EMAIL
            },
            {
                outcome: "success"
            }
        );
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/create-password");
        expect(removeEmailCodeBlockSpy).toHaveBeenCalledWith(TEST_EMAIL.toLowerCase().trim());
    });

    it("calls submitUserNamePassword with the session email and security code and renders the register/enter-email-code.njk template with an error message when a NotAuthorizedException is thrown", async () => {
        s4SubmitUsernamePasswordSpy.mockRejectedValue(
            new NotAuthorizedException({
                $metadata: {httpStatusCode: 400},
                message: "Wrong code"
            })
        );
        getEmailCodeBlockSpy.mockResolvedValue(false);

        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await submitEmailSecurityCode(mockReq, mockRes, mockNext);
        expect(s4SubmitUsernamePasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_SECURITY_CODE);
        expect(s4SetSignupStatusSpy).not.toHaveBeenCalled();
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_EMAIL_VERIFICATION_COMPLETE",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                email: TEST_EMAIL
            },
            {
                outcome: "failed"
            }
        );
        expect(mockRes.render).toHaveBeenCalledWith("register/enter-email-code.njk", {
            values: {emailAddress: TEST_EMAIL},
            errorMessages: {
                securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
            }
        });
    });

    it("puts an email code block when a not authorized exception is thrown and the session submit count is incremented to 6 or more", async () => {
        s4SubmitUsernamePasswordSpy.mockRejectedValue(
            new NotAuthorizedException({
                $metadata: {httpStatusCode: 400},
                message: "Wrong code"
            })
        );

        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL,
                emailCodeSubmitCount: 5
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await submitEmailSecurityCode(mockReq, mockRes, mockNext);
        expect(putEmailCodeBlockSpy).toHaveBeenCalledWith(TEST_EMAIL.toLowerCase().trim());
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/too-many-codes");
    });

    it("throws any other type of error thrown by s4 submitUserNamePassword", async () => {
        s4SubmitUsernamePasswordSpy.mockRejectedValue(new Error("SomeError"));

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await expect(submitEmailSecurityCode(mockReq, mockRes, mockNext)).rejects.toThrow();
        expect(s4SubmitUsernamePasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_SECURITY_CODE);
    });

    it("increments the emailSubmitCount when the code is incorrect", async () => {
        s4SubmitUsernamePasswordSpy.mockRejectedValue(
            new NotAuthorizedException({
                $metadata: {httpStatusCode: 400},
                message: "Wrong code"
            })
        );

        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                emailAddress: TEST_EMAIL
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();
        await submitEmailSecurityCode(mockReq, mockRes, mockNext);
        expect(s4SubmitUsernamePasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_SECURITY_CODE);
        expect(s4SetSignupStatusSpy).not.toHaveBeenCalled();
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_EMAIL_VERIFICATION_COMPLETE",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                email: TEST_EMAIL
            },
            {
                outcome: "failed"
            }
        );

        expect(mockReq.session.emailCodeSubmitCount).toStrictEqual(1);
        expect(mockRes.render).toHaveBeenCalledWith("register/enter-email-code.njk", {
            values: {emailAddress: TEST_EMAIL},
            errorMessages: {
                securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
            }
        });
    });
});

describe("showNewPasswordForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders register/create-password template if there is a cognitoSession present in the session", () => {
        const mockReq = request({
            session: {
                cognitoSession: TEST_COGNITO_SESSION_STRING
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        showNewPasswordForm(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("register/create-password.njk");
    });

    it("redirects to the /sign-in if there is no cognitoSession present in the session", async () => {
        const mockReq = request();
        const mockRes = response();
        const mockNext = jest.fn();
        showNewPasswordForm(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-email-address");
    });
});

describe("updatePassword controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the s4 functions with the session email and redirects to register/enter-phone-number", async () => {
        s4SetNewPasswordSpy.mockResolvedValue(TEST_AUTHENTICATION_RESULT);
        s4SetEmailAsVerifiedSpy.mockResolvedValue();
        s4SetSignUpStatusSpy.mockResolvedValue();

        const mockReq = request({
            body: {
                password: TEST_CURRENT_PASSWORD
            },
            session: {
                cognitoSession: TEST_COGNITO_SESSION_STRING,
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await updatePassword(mockReq, mockRes, mockNext);
        expect(s4SetNewPasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_CURRENT_PASSWORD, TEST_COGNITO_SESSION_STRING);
        expect(mockReq.session.authenticationResult).toStrictEqual(TEST_AUTHENTICATION_RESULT);
        expect(s4SetEmailAsVerifiedSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(s4SetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL, SignupStatusStage.HasPassword);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/enter-phone-number");
    });
});

describe("showEnterMobileForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the template with the expected options", () => {
        const mockReq = request({
            session: {
                mobileNumber: TEST_PHONE_NUMBER
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        showEnterMobileForm(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("register/enter-phone-number.njk", {
            value: {mobileNumber: TEST_PHONE_NUMBER}
        });
    });
});

describe("processEnterMobileForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("redirects to /sign-in if there is no access token in the session", async () => {
        const mockRes = response();
        const mockNext = jest.fn();
        await processEnterMobileForm(request(), mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in/enter-email-address");
    });

    it("calls the various s4 methods and redirects to /register/enter-text-code when they are successful", async () => {
        s4SetPhoneNumberSpy.mockResolvedValue();
        s4SendMobileNumberVerificationCodeSpy.mockResolvedValue();
        s4SetSignUpStatusSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                id: TEST_SESSION_ID,
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            body: {
                mobileNumber: TEST_PHONE_NUMBER
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processEnterMobileForm(mockReq, mockRes, mockNext);

        expect(s4SetPhoneNumberSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_PHONE_NUMBER);
        expect(s4SendMobileNumberVerificationCodeSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockReq.session.mobileNumber).toStrictEqual(TEST_PHONE_NUMBER);
        expect(mockReq.session.enteredMobileNumber).toStrictEqual(TEST_PHONE_NUMBER);
        expect(s4SetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL, SignupStatusStage.HasPhoneNumber);
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith("SSE_PHONE_VERIFICATION_REQUEST", {
            email: TEST_EMAIL,
            session_id: TEST_SESSION_ID,
            ip_address: TEST_IP_ADDRESS,
            phone: TEST_PHONE_NUMBER
        });
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/enter-text-code");
    });
});

describe("showSubmitMobileVerificationCode controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the enter-text-code template with the expected options", () => {
        const mockReq = request({
            session: {
                enteredMobileNumber: TEST_PHONE_NUMBER
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();
        showSubmitMobileVerificationCode(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            values: {
                mobileNumber: TEST_PHONE_NUMBER,
                textMessageNotReceivedUrl: "/register/resend-text-code"
            }
        });
    });
});

describe("submitMobileVerificationCode controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.useRealTimers();
    });

    it("re-renders the enter code template with an error message if securityCode is empty", async () => {
        const mockReq = request({
            session: {
                mobileNumber: TEST_PHONE_NUMBER
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await submitMobileVerificationCode(mockReq, mockRes, mockNext);

        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            values: {
                mobileNumber: TEST_PHONE_NUMBER,
                textMessageNotReceivedUrl: "/register/resend-text-code"
            }
        });
    });

    it("calls s4 VerifyMobileUsingSmsCode and upon CodeMismatchException re-renders the enter code template with an error message", async () => {
        getEmailSpy.mockReturnValue(TEST_EMAIL);
        s4VerifyMobileUsingSmsCodeSpy.mockRejectedValue(
            new CodeMismatchException({
                $metadata: {httpStatusCode: 400},
                message: "Wrong Code"
            })
        );
        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                mobileNumber: TEST_PHONE_NUMBER,
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                enteredMobileNumber: TEST_PHONE_NUMBER
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await submitMobileVerificationCode(mockReq, mockRes, mockNext);
        expect(s4VerifyMobileUsingSmsCodeSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken, TEST_SECURITY_CODE, TEST_EMAIL);
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_PHONE_VERIFICATION_COMPLETE",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                phone: TEST_PHONE_NUMBER
            },
            {
                outcome: "failed"
            }
        );
        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            values: {
                securityCode: TEST_SECURITY_CODE,
                mobileNumber: TEST_PHONE_NUMBER,
                textMessageNotReceivedUrl: "/register/resend-text-code"
            },
            errorMessages: {
                securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
            }
        });
    });

    it("throws any non-CodeMismatchException from s4 VerifyMobileUsingSmsCode", async () => {
        getEmailSpy.mockReturnValue(TEST_EMAIL);
        s4VerifyMobileUsingSmsCodeSpy.mockRejectedValue(new Error("someError"));

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                mobileNumber: TEST_PHONE_NUMBER,
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                enteredMobileNumber: TEST_PHONE_NUMBER
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await expect(submitMobileVerificationCode(mockReq, mockRes, mockNext)).rejects.toThrow();
    });

    it("checks the security code and upon success sets the user's mfa preference, stores the user in dynamo, sends 2 txma logs and the redirects to /register/create-service", async () => {
        getEmailSpy.mockReturnValue(TEST_EMAIL);
        s4VerifyMobileUsingSmsCodeSpy.mockResolvedValue();
        getCognitoIdSpy.mockReturnValue(TEST_COGNITO_ID);
        s4SetMfaPreferenceSpy.mockResolvedValue();
        s4PutUserSpy.mockResolvedValue();
        s4SetSignUpStatusSpy.mockResolvedValue();
        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                id: TEST_SESSION_ID,
                mobileNumber: TEST_PHONE_NUMBER,
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                enteredMobileNumber: TEST_PHONE_NUMBER
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await submitMobileVerificationCode(mockReq, mockRes, mockNext);

        expect(s4VerifyMobileUsingSmsCodeSpy).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken, TEST_SECURITY_CODE, TEST_EMAIL);
        expect(s4SetMfaPreferenceSpy).toHaveBeenCalledWith(TEST_COGNITO_ID);
        expect(s4PutUserSpy).toHaveBeenCalledWith(
            domainUserToDynamoUser({
                id: TEST_COGNITO_ID,
                fullName: "we haven't collected this full name",
                firstName: "we haven't collected this first name",
                lastName: "we haven't collected this last name",
                email: TEST_EMAIL,
                mobileNumber: TEST_PHONE_NUMBER,
                passwordLastUpdated: new Date(TEST_TIMESTAMP).toLocaleDateString()
            }),
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(s4SetSignUpStatusSpy).toHaveBeenCalledWith(TEST_EMAIL, SignupStatusStage.HasTextCode);
        expect(s4SendTxmaLogSpy).toHaveBeenNthCalledWith(
            1,
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
        expect(s4SendTxmaLogSpy).toHaveBeenNthCalledWith(2, "SSE_CREATE_ACCOUNT", {
            session_id: TEST_SESSION_ID,
            ip_address: TEST_IP_ADDRESS,
            user_id: TEST_COGNITO_ID,
            email: TEST_EMAIL
        });
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/create-service");
    });
});

describe("resendEmailVerificationCode controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 resendEmailAuthCode with the session email and then redirects to /register/enter-email-code", async () => {
        s4ResendEmailCodeSpy.mockResolvedValue();
        getEmailCodeBlockSpy.mockResolvedValue(false);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await resendEmailVerificationCode(mockReq, mockRes, mockNext);
        expect(s4ResendEmailCodeSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/enter-email-code");
    });

    it("renders too many codes if the email is code blocked", async () => {
        s4ResendEmailCodeSpy.mockResolvedValue();
        getEmailCodeBlockSpy.mockResolvedValue(true);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await resendEmailVerificationCode(mockReq, mockRes, mockNext);
        expect(s4ResendEmailCodeSpy).not.toHaveBeenCalled();
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/too-many-codes");
    });

    it("renders too many codes if the session has 6 or more email code submits", async () => {
        s4ResendEmailCodeSpy.mockResolvedValue();
        getEmailCodeBlockSpy.mockResolvedValue(true);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                emailCodeSubmitCount: 6
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await resendEmailVerificationCode(mockReq, mockRes, mockNext);
        expect(s4ResendEmailCodeSpy).not.toHaveBeenCalled();
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/too-many-codes");
    });
});

describe("showResendEmailCodeForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.resetAllMocks();
    });

    it("renders the resend email code form if email is not code blocked", async () => {
        s4ResendEmailCodeSpy.mockResolvedValue();
        getEmailCodeBlockSpy.mockResolvedValue(false);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await showResendEmailCodeForm(mockReq, mockRes, mockNext);
        expect(getEmailCodeBlockSpy).toHaveBeenCalledWith(TEST_EMAIL.toLowerCase().trim());
        expect(mockRes.render).toHaveBeenCalledWith("register/resend-email-code.njk");
    });

    it("renders too many codes if the email is code blocked", async () => {
        s4ResendEmailCodeSpy.mockResolvedValue();
        getEmailCodeBlockSpy.mockResolvedValue(true);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await showResendEmailCodeForm(mockReq, mockRes, mockNext);
        expect(getEmailCodeBlockSpy).toHaveBeenCalledWith(TEST_EMAIL.toLowerCase().trim());
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/too-many-codes");
    });

    it("renders too many codes if the session has 6 or more email code submits", async () => {
        s4ResendEmailCodeSpy.mockResolvedValue();
        getEmailCodeBlockSpy.mockResolvedValue(true);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                emailCodeSubmitCount: 6
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await showResendEmailCodeForm(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/too-many-codes");
    });
});

describe("processAddServiceForm controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(crypto, "randomUUID").mockReturnValue(TEST_UUID);
    });

    it("renders the there-is-a-problem if no userId is returned from the AuthenticationResultParser", async () => {
        getCognitoIdSpy.mockReturnValue("");

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            body: {
                serviceName: TEST_SERVICE_NAME
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processAddServiceForm(mockReq, mockRes, mockNext);

        expect(mockRes.redirect).toHaveBeenCalledWith("/there-is-a-problem");
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("calls s4 new service and renders the there-is-a-problem template if this throws an error", async () => {
        getCognitoIdSpy.mockReturnValue(TEST_COGNITO_ID);
        s4NewServiceSpy.mockRejectedValue(new Error("SomeError"));

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            body: {
                serviceName: TEST_SERVICE_NAME
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processAddServiceForm(mockReq, mockRes, mockNext);

        expect(s4NewServiceSpy).toHaveBeenCalledWith(
            {id: `service#${TEST_UUID}`, serviceName: TEST_SERVICE_NAME},
            TEST_COGNITO_ID,
            TEST_AUTHENTICATION_RESULT
        );
        expect(mockRes.redirect).toHaveBeenCalledWith("/there-is-a-problem");
    });

    it("calls s4 generateClient, renders the there-is-a-problem template and deletes the service entry if this throws an error", async () => {
        getCognitoIdSpy.mockReturnValue(TEST_COGNITO_ID);
        s4NewServiceSpy.mockResolvedValue();
        s4GenerateClientSpy.mockRejectedValue(new Error("someError"));
        s4DeleteServiceEntriesSpy.mockResolvedValue();

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT
            },
            body: {
                serviceName: TEST_SERVICE_NAME
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processAddServiceForm(mockReq, mockRes, mockNext);

        expect(s4NewServiceSpy).toHaveBeenCalledWith(
            {id: `service#${TEST_UUID}`, serviceName: TEST_SERVICE_NAME},
            TEST_COGNITO_ID,
            TEST_AUTHENTICATION_RESULT
        );
        expect(s4GenerateClientSpy).toHaveBeenCalledWith(
            {id: `service#${TEST_UUID}`, serviceName: TEST_SERVICE_NAME},
            TEST_AUTHENTICATION_RESULT
        );
        expect(s4DeleteServiceEntriesSpy).toHaveBeenCalledWith(TEST_UUID, TEST_ACCESS_TOKEN);
        expect(mockRes.redirect).toHaveBeenCalledWith("/there-is-a-problem");
    });

    it("calls the s4 newService, generateClient and sendTxMALog and then calls next if all of these are successful", async () => {
        getCognitoIdSpy.mockReturnValue(TEST_COGNITO_ID);
        s4NewServiceSpy.mockResolvedValue();
        s4GenerateClientSpy.mockResolvedValue({data: {output: JSON.stringify({body: JSON.stringify({pk: TEST_UUID})})}} as AxiosResponse);
        s4SendTxmaLogSpy.mockReturnValue();

        const mockReq = request({
            session: {
                authenticationResult: TEST_AUTHENTICATION_RESULT,
                id: TEST_SESSION_ID
            },
            body: {
                serviceName: TEST_SERVICE_NAME
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await processAddServiceForm(mockReq, mockRes, mockNext);
        expect(s4NewServiceSpy).toHaveBeenCalledWith(
            {id: `service#${TEST_UUID}`, serviceName: TEST_SERVICE_NAME},
            TEST_COGNITO_ID,
            TEST_AUTHENTICATION_RESULT
        );
        expect(s4GenerateClientSpy).toHaveBeenCalledWith(
            {id: `service#${TEST_UUID}`, serviceName: TEST_SERVICE_NAME},
            TEST_AUTHENTICATION_RESULT
        );
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_SERVICE_ADDED",
            {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS,
                user_id: TEST_COGNITO_ID
            },
            {
                service_id: TEST_UUID,
                service_name: TEST_SERVICE_NAME
            }
        );
        expect(mockNext).toHaveBeenCalled();
    });
});

describe("sendDataToUserSpreadsheet controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 updateUserSpreadsheet with session values and then calls next", async () => {
        s4updateUserSpreadsheetSpy.mockResolvedValue();

        const mockReq = request({
            session: {
                mobileNumber: TEST_PHONE_NUMBER,
                emailAddress: TEST_EMAIL,
                serviceName: TEST_SERVICE_NAME
            }
        });
        const mockNext = jest.fn();

        await sendDataToUserSpreadsheet(mockReq, response(), mockNext);
        expect(s4updateUserSpreadsheetSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_PHONE_NUMBER, TEST_SERVICE_NAME);
        expect(mockNext).toHaveBeenCalled();
    });
});

describe("redirectToServicesList controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls redirect with the substring of the serviceId", () => {
        const mockReq = request({
            session: {
                serviceId: TEST_SERVICE_ID
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        redirectToServicesList(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith(`/services/${TEST_SERVICE_ID.substring(8)}/clients`);
    });
});

describe("accountExists controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("renders the account exists template with the session email", () => {
        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        accountExists(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("register/account-exists.njk", {
            values: {
                emailAddress: TEST_EMAIL
            }
        });
    });
});

describe("resumeUserJourneyAfterPassword controller tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls s4 submitUsernamePassword with the email and password and redirects to enter-phone-number", async () => {
        s4SubmitUsernamePasswordSpy.mockResolvedValue({
            $metadata: {httpStatusCode: 200},
            Session: TEST_COGNITO_SESSION_STRING,
            AuthenticationResult: TEST_AUTHENTICATION_RESULT
        });
        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL
            },
            body: {
                password: TEST_PASSWORD
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        await resumeUserJourneyAfterPassword(mockReq, mockRes, mockNext);

        expect(s4SubmitUsernamePasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
        expect(mockReq.session.cognitoSession).toStrictEqual(TEST_COGNITO_SESSION_STRING);
        expect(mockReq.session.authenticationResult).toStrictEqual(TEST_AUTHENTICATION_RESULT);
        expect(mockRes.redirect).toHaveBeenCalledWith("/register/enter-phone-number");
    });
});
