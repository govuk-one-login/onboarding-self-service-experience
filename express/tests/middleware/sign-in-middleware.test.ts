const IsFixedCredMock = jest.fn();
const respondToMFAChallengeForFixedOTPCredentialMock = jest.fn();

jest.mock("../../src/lib/fixedOTP", () => ({
    isFixedOTPCredential: IsFixedCredMock,
    respondToMFAChallengeForFixedOTPCredential: respondToMFAChallengeForFixedOTPCredentialMock
}));

import SelfServiceServicesService from "../../src/services/self-service-services-service";
import {mockCogntioInterface, mockLambdaFacade, request, response} from "../mocks";
import processSecurityCode from "../../src/middleware/sign-in-middleware";
import {
    TEST_AUTHENTICATION_RESULT,
    TEST_COGNITO_SESSION,
    TEST_EMAIL,
    TEST_IP_ADDRESS,
    TEST_MFA_RESPONSE,
    TEST_PASSWORD,
    TEST_PHONE_NUMBER,
    TEST_SECURITY_CODE,
    TEST_SESSION_ID
} from "../constants";
import {CodeMismatchException, NotAuthorizedException} from "@aws-sdk/client-cognito-identity-provider";

const resetMfaPreferenceSpy = jest.spyOn(SelfServiceServicesService.prototype, "resetMfaPreference");
const submitUsernamePasswordSpy = jest.spyOn(SelfServiceServicesService.prototype, "submitUsernamePassword");
const setMfaPreferenceSpy = jest.spyOn(SelfServiceServicesService.prototype, "setMfaPreference");
const respondToMfaChallengeSpy = jest.spyOn(SelfServiceServicesService.prototype, "respondToMfaChallenge");
const sendTxMALogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");

const mockNext = jest.fn();

describe("processSecurityCode tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls redirect to '/sign-in if the session object lacks an mfaResponse", async () => {
        const mockReq = request({
            app: {
                get: () => new SelfServiceServicesService(mockCogntioInterface, mockLambdaFacade)
            }
        });
        const mockRes = response();
        await processSecurityCode(mockReq, mockRes, mockNext);
        expect(mockRes.redirect).toHaveBeenCalledWith("/sign-in");
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("if the username is a fixed credential, we call the fixedOTP MFA functions", async () => {
        IsFixedCredMock.mockReturnValue(true);
        respondToMFAChallengeForFixedOTPCredentialMock.mockReturnValue(void 0);
        resetMfaPreferenceSpy.mockResolvedValue(void 0);
        submitUsernamePasswordSpy.mockResolvedValue({
            $metadata: {},
            Session: TEST_COGNITO_SESSION,
            AuthenticationResult: TEST_AUTHENTICATION_RESULT
        });
        setMfaPreferenceSpy.mockResolvedValue(void 0);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                mfaResponse: TEST_MFA_RESPONSE,
                password: TEST_PASSWORD
            },
            app: {
                get: () => new SelfServiceServicesService(mockCogntioInterface, mockLambdaFacade)
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            }
        });
        const mockRes = response();
        await processSecurityCode(mockReq, mockRes, mockNext);
        expect(respondToMFAChallengeForFixedOTPCredentialMock).toHaveBeenCalledWith(TEST_EMAIL, TEST_SECURITY_CODE);
        expect(resetMfaPreferenceSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(submitUsernamePasswordSpy).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
        expect(mockReq.session.cognitoSession).toStrictEqual(TEST_COGNITO_SESSION);
        expect(mockReq.session.authenticationResult).toStrictEqual(TEST_AUTHENTICATION_RESULT);
        expect(mockNext).toHaveBeenCalled();
    });

    it("calls respondToMfaChallenge with the mfa response and security code and calls next function on success", async () => {
        IsFixedCredMock.mockReturnValue(false);
        respondToMfaChallengeSpy.mockResolvedValue(TEST_AUTHENTICATION_RESULT);
        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                mfaResponse: TEST_MFA_RESPONSE,
                password: TEST_PASSWORD
            },
            app: {
                get: () => new SelfServiceServicesService(mockCogntioInterface, mockLambdaFacade)
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            }
        });
        const mockRes = response();
        await processSecurityCode(mockReq, mockRes, mockNext);
        expect(mockReq.session.authenticationResult).toStrictEqual(TEST_AUTHENTICATION_RESULT);
        expect(mockNext).toHaveBeenCalled();
    });

    it("sends a txma log and redirects to the enter text code page when respondToMfaChallenge throws a CodeMismatchException", async () => {
        IsFixedCredMock.mockReturnValue(false);
        respondToMfaChallengeSpy.mockRejectedValue(
            new CodeMismatchException({
                $metadata: {httpStatusCode: 400},
                message: "Incorrect Code"
            })
        );
        sendTxMALogSpy.mockReturnValue(void 0);

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                mfaResponse: TEST_MFA_RESPONSE,
                password: TEST_PASSWORD,
                id: TEST_SESSION_ID,
                mobileNumber: TEST_PHONE_NUMBER
            },
            app: {
                get: () => new SelfServiceServicesService(mockCogntioInterface, mockLambdaFacade)
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processSecurityCode(mockReq, mockRes, mockNext);
        expect(sendTxMALogSpy).toHaveBeenCalledWith(
            "SSE_INVALID_CREDENTIAL",
            {
                email: TEST_EMAIL,
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS
            },
            {
                credential_type: "2FA"
            }
        );
        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            headerActiveItem: "sign-in",
            errorMessages: {
                securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
            },
            values: {
                securityCode: TEST_SECURITY_CODE,
                mobileNumber: TEST_PHONE_NUMBER
            }
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("redirects to the enter text code page when respondToMfaChallenge throws a NotAuthorizedException", async () => {
        IsFixedCredMock.mockReturnValue(false);
        respondToMfaChallengeSpy.mockRejectedValue(
            new NotAuthorizedException({
                $metadata: {httpStatusCode: 400},
                message: "Not Authorized"
            })
        );

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                mfaResponse: TEST_MFA_RESPONSE,
                password: TEST_PASSWORD,
                id: TEST_SESSION_ID,
                mobileNumber: TEST_PHONE_NUMBER
            },
            app: {
                get: () => new SelfServiceServicesService(mockCogntioInterface, mockLambdaFacade)
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await processSecurityCode(mockReq, mockRes, mockNext);
        expect(mockRes.render).toHaveBeenCalledWith("common/enter-text-code.njk", {
            headerActiveItem: "sign-in",
            errorMessages: {
                securityCode: "The code you entered is not correct or has expired - enter it again or request a new code"
            },
            values: {
                securityCode: TEST_SECURITY_CODE,
                mobileNumber: TEST_PHONE_NUMBER
            }
        });
        expect(mockNext).not.toHaveBeenCalled();
    });

    it("throws the error when it is not a CodeMismatchException or NotAuthorizedException", async () => {
        IsFixedCredMock.mockReturnValue(false);
        const error = "Some other error";
        respondToMfaChallengeSpy.mockRejectedValue(new Error(error));

        const mockReq = request({
            session: {
                emailAddress: TEST_EMAIL,
                mfaResponse: TEST_MFA_RESPONSE,
                password: TEST_PASSWORD,
                id: TEST_SESSION_ID,
                mobileNumber: TEST_PHONE_NUMBER
            },
            app: {
                get: () => new SelfServiceServicesService(mockCogntioInterface, mockLambdaFacade)
            },
            body: {
                securityCode: TEST_SECURITY_CODE
            },
            ip: TEST_IP_ADDRESS
        });
        const mockRes = response();
        await expect(processSecurityCode(mockReq, mockRes, mockNext)).rejects.toThrow(error);
        expect(mockNext).not.toHaveBeenCalled();
    });
});
