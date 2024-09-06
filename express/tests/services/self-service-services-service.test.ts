import AuthenticationResultParser from "../../src/lib/authentication-result-parser";
import {
    TEST_ACCESS_TOKEN,
    TEST_AUTHENTICATION_RESULT,
    TEST_CLIENT,
    TEST_CLIENT_ID,
    TEST_COGNITO_ID,
    TEST_COGNITO_SESSION_STRING,
    TEST_CURRENT_PASSWORD,
    TEST_DYNAMO_CLIENT,
    TEST_EMAIL,
    TEST_HOST_NAME,
    TEST_IP_ADDRESS,
    TEST_MFA_RESPONSE,
    TEST_NEW_PASSWORD,
    TEST_ONBOARDING_TABLE_ITEM,
    TEST_PASSWORD,
    TEST_PHONE_NUMBER,
    TEST_PROTOCOL,
    TEST_REFRESH_TOKEN,
    TEST_SECURITY_CODE,
    TEST_SELF_SERVICE_CLIENT_ID,
    TEST_SERVICE,
    TEST_SERVICE_FROM_DYNAMO,
    TEST_SERVICE_ID,
    TEST_SESSION_ID,
    TEST_SIGN_UP_STATUS,
    TEST_SIGN_UP_STATUS_STAGE,
    TEST_TIMESTAMP,
    TEST_USER,
    TEST_USER_FROM_DYNAMO,
    TEST_USER_ID
} from "../constants";
import {mockCognitoInterface, mockLambdaFacade} from "../mocks";
import SelfServiceServicesService from "../../src/services/self-service-services-service";
import console from "console";
import SelfServiceError from "../../src/lib/errors";
import {AdminGetUserCommandOutput, AdminInitiateAuthCommandOutput} from "@aws-sdk/client-cognito-identity-provider";
import {SignupStatus} from "../../src/lib/utils/signup-status";
const mockS4Instance = new SelfServiceServicesService(mockCognitoInterface, mockLambdaFacade);

describe("SelfServiceServicesService tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        jest.spyOn(AuthenticationResultParser, "getCognitoId").mockReturnValue(TEST_COGNITO_ID);
        jest.spyOn(AuthenticationResultParser, "getEmail").mockReturnValue(TEST_EMAIL);
        jest.spyOn(AuthenticationResultParser, "getPhoneNumber").mockReturnValue(TEST_PHONE_NUMBER);
        jest.spyOn(console, "info");
        jest.spyOn(SignupStatus.prototype, "setStage");
        jest.spyOn(SignupStatus.prototype, "getState");
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
    });

    afterEach(() => {
        jest.restoreAllMocks();
        jest.useRealTimers();
    });

    it("calls cognito ChangePassword when the changePassword method is called", () => {
        mockS4Instance.changePassword(TEST_ACCESS_TOKEN, TEST_CURRENT_PASSWORD, TEST_NEW_PASSWORD);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:changePassword()");
        expect(mockCognitoInterface.changePassword).toHaveBeenCalledWith(TEST_ACCESS_TOKEN, TEST_CURRENT_PASSWORD, TEST_NEW_PASSWORD);
    });

    it("calls cognito forgotPassword when the forgotPassword method is called", () => {
        mockS4Instance.forgotPassword(TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, true);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:forgotPassword()");
        expect(mockCognitoInterface.forgotPassword).toHaveBeenCalledWith(TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, true);
    });

    it("calls cognito confirmForgotPassword when the confirmForgotPassword method is called", () => {
        mockS4Instance.confirmForgotPassword(TEST_EMAIL, TEST_CURRENT_PASSWORD, TEST_SECURITY_CODE);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:confirmForgotPassword()");
        expect(mockCognitoInterface.confirmForgotPassword).toHaveBeenCalledWith(TEST_EMAIL, TEST_CURRENT_PASSWORD, TEST_SECURITY_CODE);
    });

    it("calls cognito respondToMfaChallenge when the respondToMfaChallenge method is called and throws if there is no Authentication result", async () => {
        mockCognitoInterface.respondToMfaChallenge.mockResolvedValue({});
        await expect(mockS4Instance.respondToMfaChallenge(TEST_MFA_RESPONSE, TEST_SECURITY_CODE)).rejects.toThrow(
            new SelfServiceError("Did not get AuthenticationResult from Cognito")
        );
        expect(mockCognitoInterface.respondToMfaChallenge).toHaveBeenCalledWith(
            TEST_MFA_RESPONSE.cognitoId,
            TEST_SECURITY_CODE,
            TEST_MFA_RESPONSE.cognitoSession
        );
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:respondToMfaChallenge()");
    });

    it("calls cognito respondToMfaChallenge when the respondToMfaChallenge method and returns the AuthenticationResult", async () => {
        mockCognitoInterface.respondToMfaChallenge.mockResolvedValue({AuthenticationResult: TEST_AUTHENTICATION_RESULT});
        const receivedAuthenticationResult = await mockS4Instance.respondToMfaChallenge(TEST_MFA_RESPONSE, TEST_SECURITY_CODE);
        expect(mockCognitoInterface.respondToMfaChallenge).toHaveBeenCalledWith(
            TEST_MFA_RESPONSE.cognitoId,
            TEST_SECURITY_CODE,
            TEST_MFA_RESPONSE.cognitoSession
        );
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:respondToMfaChallenge()");
        expect(receivedAuthenticationResult).toStrictEqual(TEST_AUTHENTICATION_RESULT);
    });

    it("throws an error when getSelfServiceUser is called with an authentication result with no IdToken", async () => {
        await expect(mockS4Instance.getSelfServiceUser({...TEST_AUTHENTICATION_RESULT, IdToken: undefined})).rejects.toThrow(
            new SelfServiceError("IdToken not present")
        );
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:getSelfServiceUser()");
    });

    it("throws an error when getSelfServiceUser is called with an authentication result with no AccessToken", async () => {
        await expect(mockS4Instance.getSelfServiceUser({...TEST_AUTHENTICATION_RESULT, AccessToken: undefined})).rejects.toThrow(
            new SelfServiceError("AccessToken not present")
        );
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:getSelfServiceUser()");
    });

    it("calls validate token and getUserByCognitoId and returns a user when the getSelfServiceUser method is called ", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});
        mockLambdaFacade.getUserByCognitoId.mockResolvedValue({
            data: {
                Item: TEST_USER_FROM_DYNAMO
            }
        });

        const receivedUser = await mockS4Instance.getSelfServiceUser(TEST_AUTHENTICATION_RESULT);

        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.getUserByCognitoId).toHaveBeenCalledWith(TEST_COGNITO_ID, TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(receivedUser).toStrictEqual(TEST_USER);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:getSelfServiceUser()");
    });

    it("calls cognito login with the mail and password when the login method is called", async () => {
        mockCognitoInterface.login.mockResolvedValue({
            $metadata: {httpStatusCode: 200},
            Session: TEST_COGNITO_SESSION_STRING,
            ChallengeParameters: {
                USER_ID_FOR_SRP: TEST_COGNITO_ID,
                CODE_DELIVERY_DESTINATION: TEST_PHONE_NUMBER
            }
        } as AdminInitiateAuthCommandOutput);

        const receivedMfaResponse = await mockS4Instance.login(TEST_EMAIL, TEST_PASSWORD);

        expect(mockCognitoInterface.login).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
        expect(receivedMfaResponse).toStrictEqual({
            cognitoSession: TEST_COGNITO_SESSION_STRING,
            cognitoId: TEST_COGNITO_ID,
            codeSentTo: TEST_PHONE_NUMBER
        });
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:login()");
    });

    it("calls validate token and lambda putUser when the putUser method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}} as AdminInitiateAuthCommandOutput);
        mockLambdaFacade.putUser.mockResolvedValue(void 0);

        await mockS4Instance.putUser(TEST_ONBOARDING_TABLE_ITEM, TEST_ACCESS_TOKEN);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.putUser).toHaveBeenCalledWith(TEST_ONBOARDING_TABLE_ITEM, TEST_ACCESS_TOKEN);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:putUser()");
    });

    it("calls cognito setNewPassword when the setNewPassword method is called and returns the Authentication Result", async () => {
        mockCognitoInterface.setNewPassword.mockResolvedValue({AuthenticationResult: TEST_AUTHENTICATION_RESULT});

        const receivedAuthenticationResult = await mockS4Instance.setNewPassword(TEST_EMAIL, TEST_PASSWORD, TEST_COGNITO_SESSION_STRING);
        expect(mockCognitoInterface.setNewPassword).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD, TEST_COGNITO_SESSION_STRING);
        expect(receivedAuthenticationResult).toStrictEqual(TEST_AUTHENTICATION_RESULT);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:setNewPassword()");
    });

    it("calls cognito setEmailAsVerified when the setEmailAsVerified method is called", async () => {
        mockCognitoInterface.setEmailAsVerified.mockResolvedValue(void 0);

        await mockS4Instance.setEmailAsVerified(TEST_EMAIL);
        expect(mockCognitoInterface.setEmailAsVerified).toHaveBeenCalledWith(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:setEmailAsVerified()");
    });

    it("calls cognito createUser when the createUser method is called", async () => {
        mockCognitoInterface.createUser.mockResolvedValue(void 0);

        await mockS4Instance.createUser(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:createUser()");
        expect(mockCognitoInterface.createUser).toHaveBeenCalledWith(TEST_EMAIL);
    });

    it("calls cognito resendEmailAuthCode when the resendEmailAuthCode method is called", async () => {
        mockCognitoInterface.resendEmailAuthCode.mockResolvedValue(void 0);

        await mockS4Instance.resendEmailAuthCode(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:resendEmailAuthCode()");
        expect(mockCognitoInterface.resendEmailAuthCode).toHaveBeenCalledWith(TEST_EMAIL);
    });

    it("calls cognito login when the submitUsernamePassword method is called", async () => {
        mockCognitoInterface.login.mockResolvedValue(void 0);

        await mockS4Instance.submitUsernamePassword(TEST_EMAIL, TEST_PASSWORD);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:submitUsernamePassword()");
        expect(mockCognitoInterface.login).toHaveBeenCalledWith(TEST_EMAIL, TEST_PASSWORD);
    });

    it("calls cognito setPhoneNumber when the setPhoneNumber method is called", async () => {
        mockCognitoInterface.setPhoneNumber.mockResolvedValue(void 0);

        await mockS4Instance.setPhoneNumber(TEST_EMAIL, TEST_PHONE_NUMBER);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:setPhoneNumber()");
        expect(mockCognitoInterface.setPhoneNumber).toHaveBeenCalledWith(TEST_EMAIL, TEST_PHONE_NUMBER);
    });

    it("calls cognito setMfaPreference when the setMfaPreference method is called", async () => {
        mockCognitoInterface.setMfaPreference.mockResolvedValue(void 0);

        await mockS4Instance.setMfaPreference(TEST_COGNITO_ID);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:setMfaPreference()");
        expect(mockCognitoInterface.setMfaPreference).toHaveBeenCalledWith(TEST_COGNITO_ID);
    });

    it("calls cognito resetMfaPreference when the resetMfaPreference method is called", async () => {
        mockCognitoInterface.resetMfaPreference.mockResolvedValue(void 0);

        await mockS4Instance.resetMfaPreference(TEST_COGNITO_ID);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:resetMfaPreference()");
        expect(mockCognitoInterface.resetMfaPreference).toHaveBeenCalledWith(TEST_COGNITO_ID);
    });

    it("calls cognito sendMobileNumberVerificationCode when the sendMobileNumberVerificationCode method is called with the refreshToken", async () => {
        mockCognitoInterface.sendMobileNumberVerificationCode.mockResolvedValue(void 0);

        await mockS4Instance.sendMobileNumberVerificationCode(TEST_ACCESS_TOKEN);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:sendMobileVerificationCode()");
        expect(mockCognitoInterface.sendMobileNumberVerificationCode).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
    });

    it("calls cognito useRefreshToken when the useRefreshToken method is called with the accessToken", async () => {
        const refreshTokenResponse: AdminInitiateAuthCommandOutput = {
            $metadata: {httpStatusCode: 200},
            AuthenticationResult: TEST_AUTHENTICATION_RESULT
        };
        mockCognitoInterface.useRefreshToken.mockResolvedValue(refreshTokenResponse);

        const response = await mockS4Instance.useRefreshToken(TEST_REFRESH_TOKEN);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:useRefreshToken()");
        expect(mockCognitoInterface.useRefreshToken).toHaveBeenCalledWith(TEST_REFRESH_TOKEN);
        expect(response).toStrictEqual(refreshTokenResponse);
    });

    it("calls cognito verifyMobileUsingSmsCode with the expected values when the verifyMobileUsingSmsCode ", async () => {
        mockCognitoInterface.verifyMobileUsingSmsCode.mockResolvedValue(void 0);

        await mockS4Instance.verifyMobileUsingSmsCode(TEST_ACCESS_TOKEN, TEST_SECURITY_CODE, TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:verifyMobileUsingSmsCode()");
        expect(mockCognitoInterface.verifyMobileUsingSmsCode).toHaveBeenCalledWith(TEST_ACCESS_TOKEN, TEST_SECURITY_CODE, TEST_EMAIL);
    });

    it("calls cognito setMobilePhoneAsVerified with the expected values when the setMobilePhoneAsVerified method is called", async () => {
        mockCognitoInterface.setMobilePhoneAsVerified.mockResolvedValue(void 0);

        await mockS4Instance.setMobilePhoneAsVerified(TEST_EMAIL);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:setMobilePhoneAsVerified()");
        expect(mockCognitoInterface.setMobilePhoneAsVerified).toHaveBeenCalledWith(TEST_EMAIL);
    });

    it("calls expected cognito methods with the expected values when the setSignUpStatus method is called", async () => {
        const mockSignUpStatus = new SignupStatus();
        jest.spyOn(mockS4Instance, "getSignUpStatus").mockResolvedValue(mockSignUpStatus);

        await mockS4Instance.setSignUpStatus(TEST_EMAIL, TEST_SIGN_UP_STATUS_STAGE);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:setSignUpStatus()");
        expect(mockS4Instance.getSignUpStatus).toHaveBeenCalledWith(TEST_EMAIL);
        expect(mockSignUpStatus.setStage).toHaveBeenCalledWith(TEST_SIGN_UP_STATUS_STAGE, true);
        expect(mockCognitoInterface.setSignUpStatus).toHaveBeenCalledWith(TEST_EMAIL, mockSignUpStatus.getState());
    });

    it("calls the cognito adminGetUserCommand method and throws if no userAttributes are returned", async () => {
        mockCognitoInterface.adminGetUserCommandOutput.mockResolvedValue({
            $metadata: {httpStatusCode: 200},
            UserAttributes: null,
            Username: TEST_EMAIL
        } as unknown as AdminGetUserCommandOutput);

        await expect(mockS4Instance.getSignUpStatus(TEST_EMAIL)).rejects.toThrow(
            new Error("Unable to get Sign Up Status Custom Attribute")
        );
    });

    it("calls the cognito adminGetUserCommand method and returns a signUpStatus with the ", async () => {
        mockCognitoInterface.adminGetUserCommandOutput.mockResolvedValue({
            $metadata: {httpStatusCode: 200},
            UserAttributes: [
                {
                    Name: "custom:signup_status",
                    Value: TEST_SIGN_UP_STATUS
                }
            ],
            Username: TEST_EMAIL
        });

        const expectedSignUpStatus = new SignupStatus();
        expectedSignUpStatus.setState(TEST_SIGN_UP_STATUS);

        const receivedSignUpStatus = await mockS4Instance.getSignUpStatus(TEST_EMAIL);
        expect(mockCognitoInterface.adminGetUserCommandOutput).toHaveBeenCalledWith(TEST_EMAIL);
        expect(receivedSignUpStatus).toStrictEqual(expectedSignUpStatus);
    });

    it("calls the validateToken and lambda newService method with the expected values when the new service method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});

        await mockS4Instance.newService(TEST_SERVICE, TEST_COGNITO_ID, TEST_AUTHENTICATION_RESULT);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockLambdaFacade.newService).toHaveBeenCalledWith(
            TEST_SERVICE,
            TEST_COGNITO_ID,
            TEST_EMAIL,
            TEST_AUTHENTICATION_RESULT.AccessToken
        );
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:newService()");
    });

    it("calls the validateToken and lambda generateClient method with the expected values when the generateClient method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});

        await mockS4Instance.generateClient(TEST_SERVICE, TEST_AUTHENTICATION_RESULT);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_AUTHENTICATION_RESULT.AccessToken);
        expect(mockLambdaFacade.generateClient).toHaveBeenCalledWith(TEST_SERVICE, TEST_AUTHENTICATION_RESULT);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:generateClient");
    });

    it("calls the validateToken and lambda updateClient method with the expected values when the updateClient method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});
        const mockUpdates = {someField: "updated"};

        await mockS4Instance.updateClient(TEST_SERVICE_ID, TEST_SELF_SERVICE_CLIENT_ID, TEST_CLIENT_ID, mockUpdates, TEST_ACCESS_TOKEN);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.updateClient).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            mockUpdates,
            TEST_ACCESS_TOKEN
        );
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:updateClient()");
    });

    it("calls the validateToken and lambda updateService method with the expected values when the updateService method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});
        const mockUpdates = {service_name: "updated"};

        await mockS4Instance.updateService(TEST_SERVICE_ID, TEST_SELF_SERVICE_CLIENT_ID, TEST_CLIENT_ID, mockUpdates, TEST_ACCESS_TOKEN);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.updateService).toHaveBeenCalledWith(
            TEST_SERVICE_ID,
            TEST_SELF_SERVICE_CLIENT_ID,
            TEST_CLIENT_ID,
            mockUpdates,
            TEST_ACCESS_TOKEN
        );
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:updateService()");
    });

    it("calls the validateToken and lambda listServices method with the expected values when the listServices method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});
        mockLambdaFacade.listServices.mockResolvedValue({
            data: {
                Items: [TEST_SERVICE_FROM_DYNAMO, TEST_SERVICE_FROM_DYNAMO]
            }
        });

        const receivedServices = await mockS4Instance.listServices(TEST_USER_ID, TEST_ACCESS_TOKEN);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.listServices).toHaveBeenCalledWith(TEST_USER_ID);
        expect(receivedServices).toStrictEqual([TEST_SERVICE, TEST_SERVICE]);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:listServices()");
    });

    it("calls the validateToken and lambda updateUser method with the expected values when the updateUser method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});
        mockLambdaFacade.updateUser.mockResolvedValue(void 0);
        const mockUserUpdates = {someField: "updated"};

        await mockS4Instance.updateUser(TEST_USER_ID, mockUserUpdates, TEST_ACCESS_TOKEN);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.updateUser).toHaveBeenCalledWith(TEST_USER_ID, mockUserUpdates, TEST_ACCESS_TOKEN);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:updateUser()");
    });

    it("calls the validateToken and lambda listClients method with the expected values when the listClients method is called", async () => {
        mockCognitoInterface.getUser.mockResolvedValue({$metadata: {httpStatusCode: 200}});
        mockLambdaFacade.listClients.mockResolvedValue({
            data: {
                Items: [TEST_DYNAMO_CLIENT, TEST_DYNAMO_CLIENT]
            }
        });

        const receivedClients = await mockS4Instance.listClients(TEST_SERVICE_ID, TEST_ACCESS_TOKEN);
        expect(mockCognitoInterface.getUser).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.listClients).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_ACCESS_TOKEN);
        expect(receivedClients).toStrictEqual([TEST_CLIENT, TEST_CLIENT]);
        expect(console.info).toHaveBeenCalledWith("In self-service-services-service:listClients()");
    });

    it("calls the cognito globalSignOut and lambda globalSignOut methods  with the expected values when the globalSignOut method is called", async () => {
        mockCognitoInterface.globalSignOut.mockResolvedValue(void 0);
        const mockLambdaResponse = {status: 200, statusText: "Signed out"};
        mockLambdaFacade.globalSignOut.mockResolvedValue(mockLambdaResponse);

        const signOutResponse = await mockS4Instance.globalSignOut(TEST_EMAIL, TEST_ACCESS_TOKEN);
        expect(mockCognitoInterface.globalSignOut).toHaveBeenCalledWith(TEST_ACCESS_TOKEN);
        expect(mockLambdaFacade.globalSignOut).toHaveBeenCalledWith(TEST_EMAIL);
        expect(signOutResponse).toStrictEqual(mockLambdaResponse);
    });

    it("calls the lambda sessionCount method  with the expected values when the sessionCount method is called", async () => {
        mockLambdaFacade.sessionCount.mockResolvedValue({
            data: {
                sessionCount: 5
            }
        });
        const receivedSessionCount = await mockS4Instance.sessionCount(TEST_EMAIL);
        expect(mockLambdaFacade.sessionCount).toHaveBeenCalledWith(TEST_EMAIL);
        expect(receivedSessionCount).toEqual(5);
    });

    it("calls lambda sendTxmaLog Method with the provided values", async () => {
        mockLambdaFacade.sendTxMALog.mockResolvedValue(void 0);
        await mockS4Instance.sendTxMALog("SomeEventName", {
            session_id: TEST_SESSION_ID,
            ip_address: TEST_IP_ADDRESS
        });

        expect(mockLambdaFacade.sendTxMALog).toHaveBeenCalledWith({
            timestamp: Math.floor(TEST_TIMESTAMP / 1000),
            event_name: "SomeEventName",
            component_id: "SSE",
            user: {
                session_id: TEST_SESSION_ID,
                ip_address: TEST_IP_ADDRESS
            }
        });
    });

    it("calls lambda getDynamoDBEntries Method with the provided values", async () => {
        mockLambdaFacade.getDynamoDBEntries.mockResolvedValue({
            data: {
                Items: [TEST_USER_FROM_DYNAMO]
            }
        });

        const dynamoResponse = await mockS4Instance.getDynamoDBEntries(TEST_EMAIL);

        expect(mockLambdaFacade.getDynamoDBEntries).toHaveBeenCalledWith(TEST_EMAIL);
        expect(dynamoResponse).toStrictEqual({
            data: {
                Items: [TEST_USER_FROM_DYNAMO]
            }
        });
    });
});
