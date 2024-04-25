const IsFixedCredMock = jest.fn();
const IsPseudoFixedOTPCredMock = jest.fn();

jest.mock("../../src/services/self-service-services-service");
jest.mock("../../src/lib/fixedOTP", () => ({
    isFixedOTPCredential: IsFixedCredMock,
    isPseudonymisedFixedOTPCredential: IsPseudoFixedOTPCredMock
}));

import processSignInForm from "../../src/middleware/process-sign-in-form";
import {request, response} from "../mocks";
import {NotAuthorizedException, UserNotFoundException} from "@aws-sdk/client-cognito-identity-provider";
import SelfServiceServicesService from "../../src/services/self-service-services-service";
import {AxiosResponse} from "axios";
import {
    TEST_DYNAMO_USER,
    TEST_EMAIL,
    TEST_IP_ADDRESS,
    TEST_MFA_RESPONSE,
    TEST_PASSWORD,
    TEST_PHONE_NUMBER,
    TEST_SESSION_ID,
    TEST_TEMPLATE_PATH
} from "../constants";

const s4LoginSpy = jest.spyOn(SelfServiceServicesService.prototype, "login");
const s4SendTxmaLogSpy = jest.spyOn(SelfServiceServicesService.prototype, "sendTxMALog");
const s4RecoverCognitoSpy = jest.spyOn(SelfServiceServicesService.prototype, "recoverCognitoAccount");
const s4GetDynamoDbEntriesSpy = jest.spyOn(SelfServiceServicesService.prototype, "getDynamoDBEntries");

const mockNext = jest.fn();

describe("processSignInForm tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.USE_COGNITO_DR;
    });

    it.each([null, ""])(
        "renders the provided template with a enter password error message when the submitted password is '%s'",
        async password => {
            IsPseudoFixedOTPCredMock.mockReturnValue(false);
            const mockRequest = request({
                session: {
                    emailAddress: TEST_EMAIL
                },
                body: {
                    password: password
                }
            });
            const mockResponse = response();
            const processSignInFormMiddleware = processSignInForm(TEST_TEMPLATE_PATH);
            await processSignInFormMiddleware(mockRequest, mockResponse, mockNext);
            expect(mockResponse.render).toHaveBeenCalledWith(TEST_TEMPLATE_PATH, {
                values: {
                    password: password,
                    emailAddress: TEST_EMAIL
                },
                errorMessages: {
                    password: "Enter your password"
                }
            });
            expect(s4LoginSpy).not.toHaveBeenCalled();
        }
    );

    it("renders the template with an Incorrect password error message when s4.login throws an NotAuthorizedException", async () => {
        IsPseudoFixedOTPCredMock.mockReturnValue(false);
        s4LoginSpy.mockRejectedValue(new NotAuthorizedException({$metadata: {}, message: "Incorrect Password"}));
        const mockRequest = request({
            session: {
                emailAddress: TEST_EMAIL,
                id: TEST_SESSION_ID
            },
            body: {
                password: TEST_PASSWORD
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();
        const processSignInFormMiddleware = processSignInForm(TEST_TEMPLATE_PATH);
        await processSignInFormMiddleware(mockRequest, mockResponse, mockNext);
        expect(s4SendTxmaLogSpy).toHaveBeenCalledWith(
            "SSE_INVALID_CREDENTIAL",
            {
                email: TEST_EMAIL,
                session_id: mockRequest.session.id,
                ip_address: mockRequest.ip
            },
            {
                credential_type: "password"
            }
        );
        expect(mockResponse.render).toHaveBeenCalledWith(TEST_TEMPLATE_PATH, {
            values: {
                password: TEST_PASSWORD,
                emailAddress: TEST_EMAIL
            },
            errorMessages: {
                password: "Incorrect password"
            }
        });
    });

    it("renders the account not found template when s4.login throws a UserNotFoundException", async () => {
        IsPseudoFixedOTPCredMock.mockReturnValue(false);
        s4LoginSpy.mockRejectedValue(new UserNotFoundException({$metadata: {}, message: "User Not Found"}));
        const mockRequest = request({
            session: {
                emailAddress: TEST_EMAIL,
                id: TEST_SESSION_ID
            },
            body: {
                password: TEST_PASSWORD
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();
        const processSignInFormMiddleware = processSignInForm(TEST_TEMPLATE_PATH);
        await processSignInFormMiddleware(mockRequest, mockResponse, mockNext);
        expect(mockResponse.redirect).toHaveBeenCalledWith("/sign-in/account-not-found");
    });

    it("renders the account recovery route if USE_COGNITO_DR is true", async () => {
        process.env.USE_COGNITO_DR = "true";
        IsPseudoFixedOTPCredMock.mockReturnValue(false);
        s4LoginSpy.mockRejectedValue(new UserNotFoundException({$metadata: {}, message: "User Not Found"}));
        s4GetDynamoDbEntriesSpy.mockResolvedValue({data: TEST_DYNAMO_USER} as AxiosResponse);
        const mockRequest = request({
            session: {
                emailAddress: TEST_EMAIL,
                id: TEST_SESSION_ID
            },
            body: {
                password: TEST_PASSWORD
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();
        const processSignInFormMiddleware = processSignInForm(TEST_TEMPLATE_PATH);
        await processSignInFormMiddleware(mockRequest, mockResponse, mockNext);
        expect(s4GetDynamoDbEntriesSpy).toHaveBeenCalledWith(TEST_EMAIL);
        expect(s4RecoverCognitoSpy).toHaveBeenCalledWith(mockRequest, TEST_EMAIL, TEST_PASSWORD, TEST_PHONE_NUMBER);
        expect(mockResponse.redirect).toHaveBeenCalledWith("/sign-in/enter-text-code-then-continue-recovery");
    });

    it("sets the session value password if email is fixed credential", async () => {
        s4LoginSpy.mockResolvedValue(TEST_MFA_RESPONSE);
        IsPseudoFixedOTPCredMock.mockReturnValue(false);
        IsFixedCredMock.mockReturnValue(true);
        const mockRequest = request({
            session: {
                emailAddress: TEST_EMAIL,
                id: TEST_SESSION_ID
            },
            body: {
                password: TEST_PASSWORD
            },
            ip: TEST_IP_ADDRESS
        });
        const mockResponse = response();
        const processSignInFormMiddleware = processSignInForm(TEST_TEMPLATE_PATH);
        await processSignInFormMiddleware(mockRequest, mockResponse, mockNext);
        expect((mockRequest.session as Record<string, unknown>).password).toStrictEqual(TEST_PASSWORD);
        expect(mockResponse.redirect).toHaveBeenCalledWith("/sign-in/enter-text-code");
    });
});
