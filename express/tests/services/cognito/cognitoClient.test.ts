import {
    AdminCreateUserCommand,
    AdminGetUserCommand,
    AdminInitiateAuthCommand,
    AdminRespondToAuthChallengeCommand,
    AdminSetUserMFAPreferenceCommand,
    AdminSetUserPasswordCommand,
    AdminUpdateUserAttributesCommand,
    ChangePasswordCommand,
    CognitoIdentityProviderClient,
    ConfirmForgotPasswordCommand,
    ForgotPasswordCommand,
    GetUserAttributeVerificationCodeCommand,
    GetUserCommand,
    GlobalSignOutCommand,
    RespondToAuthChallengeCommand,
    UpdateUserPoolClientCommand,
    VerifyUserAttributeCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {
    TEST_ACCESS_TOKEN,
    TEST_COGNITO_CLIENT_ID,
    TEST_COGNITO_SESSION_STRING,
    TEST_COGNITO_USER_POOL_ID,
    TEST_CURRENT_PASSWORD,
    TEST_EMAIL,
    TEST_HOST_NAME,
    TEST_NEW_PASSWORD,
    TEST_PASSWORD,
    TEST_PHONE_NUMBER,
    TEST_PROTOCOL,
    TEST_REFRESH_TOKEN,
    TEST_SECURITY_CODE,
    TEST_SIGN_UP_STATUS
} from "../../constants";
import {mockClient} from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import CognitoClient from "../../../src/services/cognito/CognitoClient";

import crypto from "node:crypto";

const fixedBuffer = Buffer.from("6e4195129066135da2c81745247bb0edf82e00da5a8925d1a1289629ad8633");

const mockCognitoClient = mockClient(CognitoIdentityProviderClient);

describe("cognito client tests", () => {
    beforeEach(() => {
        jest.spyOn(crypto, "randomBytes").mockImplementation(() => fixedBuffer);
        jest.clearAllMocks();
        mockCognitoClient.reset();
    });

    afterEach(() => {
        jest.spyOn(Math, "random").mockRestore();
    });

    it("updates the user pool maf duration to 15 mins on instantiating a new client", () => {
        new CognitoClient();
        expect(mockCognitoClient).toHaveReceivedCommandWith(UpdateUserPoolClientCommand, {
            ClientId: TEST_COGNITO_CLIENT_ID,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            AuthSessionValidity: 15,
            ExplicitAuthFlows: ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
        });
    });

    it("sends an AdminCreateUserCommand with the expected values when the createUser method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.createUser(TEST_EMAIL);

        const expectedTemporaryPassword = fixedBuffer.toString("base64url");

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            TemporaryPassword: expectedTemporaryPassword,
            UserAttributes: [
                {Name: "email", Value: TEST_EMAIL},
                {Name: "custom:signup_status", Value: ""}
            ]
        });
    });

    it("sends an AdminCreateUserCommand with the expected values when the recoverUser method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.recoverUser(TEST_EMAIL);

        const expectedTemporaryPassword = fixedBuffer.toString("base64url");

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            MessageAction: "SUPPRESS",
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            TemporaryPassword: expectedTemporaryPassword,
            UserAttributes: [
                {Name: "email", Value: TEST_EMAIL},
                {Name: "custom:signup_status", Value: "HasEmail,HasPassword,HasPhoneNumber,HasTextCode"}
            ]
        });
    });

    it("sends an AdminCreateUserCommand with the expected values when the resendEmailAuthCode method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.resendEmailAuthCode(TEST_EMAIL);

        const expectedTemporaryPassword = fixedBuffer.toString("base64url");

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            MessageAction: "RESEND",
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            TemporaryPassword: expectedTemporaryPassword,
            UserAttributes: [{Name: "email", Value: TEST_EMAIL}]
        });
    });

    it("sends an AdminInitiateAuth command when the login method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.login(TEST_EMAIL, TEST_PASSWORD);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminInitiateAuthCommand, {
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            ClientId: TEST_COGNITO_CLIENT_ID,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: TEST_EMAIL,
                PASSWORD: TEST_PASSWORD
            }
        });
    });

    it("sends an GlobalSignOutCommand when the globalSignOut method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.globalSignOut(TEST_ACCESS_TOKEN);

        expect(mockCognitoClient).toHaveReceivedCommandWith(GlobalSignOutCommand, {
            AccessToken: TEST_ACCESS_TOKEN
        });
    });

    it("sends a GetUserCommand with the access token when the getUser Method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.getUser(TEST_ACCESS_TOKEN);

        expect(mockCognitoClient).toHaveReceivedCommandWith(GetUserCommand, {
            AccessToken: TEST_ACCESS_TOKEN
        });
    });

    it("sends a RespondToAuthChallenge Command when the setNewPassword method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.setNewPassword(TEST_EMAIL, TEST_PASSWORD, TEST_COGNITO_SESSION_STRING);

        expect(mockCognitoClient).toHaveReceivedCommandWith(RespondToAuthChallengeCommand, {
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ChallengeResponses: {
                NEW_PASSWORD: TEST_PASSWORD,
                USERNAME: TEST_EMAIL
            },
            ClientId: TEST_COGNITO_CLIENT_ID,
            Session: TEST_COGNITO_SESSION_STRING
        });
    });

    it("sends a ChangePassword command with the expected values when the changePassword method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.changePassword(TEST_ACCESS_TOKEN, TEST_CURRENT_PASSWORD, TEST_NEW_PASSWORD);

        expect(mockCognitoClient).toHaveReceivedCommandWith(ChangePasswordCommand, {
            AccessToken: TEST_ACCESS_TOKEN,
            PreviousPassword: TEST_CURRENT_PASSWORD,
            ProposedPassword: TEST_NEW_PASSWORD
        });
    });

    it("sends a ForgotPasswordCommand with the expected values when the forgotPassword Method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.forgotPassword(TEST_EMAIL, TEST_PROTOCOL, TEST_HOST_NAME, true);

        expect(mockCognitoClient).toHaveReceivedCommandWith(ForgotPasswordCommand, {
            ClientId: TEST_COGNITO_CLIENT_ID,
            Username: TEST_EMAIL,
            ClientMetadata: {
                protocol: TEST_PROTOCOL,
                host: TEST_HOST_NAME.split("").join("/"),
                username: TEST_EMAIL,
                use_recovered_account_url: "true"
            }
        });
    });

    it("sends a ConfirmForgotPasswordCommand with the expected values when the confirmForgotPassword is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.confirmForgotPassword(TEST_EMAIL, TEST_PASSWORD, TEST_SECURITY_CODE);

        expect(mockCognitoClient).toHaveReceivedCommandWith(ConfirmForgotPasswordCommand, {
            ClientId: TEST_COGNITO_CLIENT_ID,
            Username: TEST_EMAIL,
            Password: TEST_PASSWORD,
            ConfirmationCode: TEST_SECURITY_CODE,
            ClientMetadata: {
                email: TEST_EMAIL
            }
        });
    });

    it("sends a AdminSetUserPassword with the expected values when the setUserPassword method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.setUserPassword(TEST_EMAIL, TEST_PASSWORD);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminSetUserPasswordCommand, {
            Password: TEST_PASSWORD,
            Permanent: true,
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID
        });
    });

    it("sends a AdminUpdateUserAttributeCommand with the expected values when the setEmailAsVerified method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.setEmailAsVerified(TEST_EMAIL);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminUpdateUserAttributesCommand, {
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            UserAttributes: [
                {
                    Name: "email_verified",
                    Value: "true"
                }
            ]
        });
    });

    it("sends a AdminUpdateUserAttributesCommand with the expected values when the setSignUpStatus method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.setSignUpStatus(TEST_EMAIL, TEST_SIGN_UP_STATUS);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminUpdateUserAttributesCommand, {
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            UserAttributes: [
                {
                    Name: "custom:signup_status",
                    Value: TEST_SIGN_UP_STATUS
                }
            ]
        });
    });

    it("sends an adminGetUserCommand with the expected values when the adminGetUserCommandOutput method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.adminGetUserCommandOutput(TEST_EMAIL);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminGetUserCommand, {
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID
        });
    });

    it("sends an AdminUpdateUserAttributesCommand with the expected values when the setMobilePhoneAsVerified method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.setMobilePhoneAsVerified(TEST_EMAIL);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminUpdateUserAttributesCommand, {
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            UserAttributes: [
                {
                    Name: "phone_number_verified",
                    Value: "true"
                }
            ]
        });
    });

    it("sends an AdminUpdateUserAttributesCommand with the expected values when the setPhoneNumber method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.setPhoneNumber(TEST_EMAIL, TEST_PHONE_NUMBER);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminUpdateUserAttributesCommand, {
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            UserAttributes: [
                {
                    Name: "phone_number",
                    Value: TEST_PHONE_NUMBER
                }
            ]
        });
    });

    it("sends an GetUserAttributeVerificationCodeCommand with the expected values when the sendMobileNumberVerificationCode method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.sendMobileNumberVerificationCode(TEST_ACCESS_TOKEN);

        expect(mockCognitoClient).toHaveReceivedCommandWith(GetUserAttributeVerificationCodeCommand, {
            AccessToken: TEST_ACCESS_TOKEN,
            AttributeName: "phone_number"
        });
    });

    it("sends an VerifyUserAttributeCommand with the expected values when the VerifyUserAttributeCommand method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.verifyMobileUsingSmsCode(TEST_ACCESS_TOKEN, TEST_SECURITY_CODE, TEST_EMAIL);

        expect(mockCognitoClient).toHaveReceivedCommandWith(VerifyUserAttributeCommand, {
            AccessToken: TEST_ACCESS_TOKEN,
            AttributeName: "phone_number",
            Code: TEST_SECURITY_CODE
        });
    });

    it("sets the mfa preference to SMS using an AdminSetUserMFAPreferenceCommand when the setMfaPreference method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.setMfaPreference(TEST_EMAIL);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminSetUserMFAPreferenceCommand, {
            SMSMfaSettings: {
                Enabled: true,
                PreferredMfa: true
            },
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID
        });
    });

    it("disables SMS MFA using an resetMfaPreference command when the resetMfaPreference method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.resetMfaPreference(TEST_EMAIL);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminSetUserMFAPreferenceCommand, {
            SMSMfaSettings: {
                Enabled: false
            },
            Username: TEST_EMAIL,
            UserPoolId: TEST_COGNITO_USER_POOL_ID
        });
    });

    it("sends a AdminRespondToAuthChallengeCommand with the mfa code when the respondToMfaChallenge method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.respondToMfaChallenge(TEST_EMAIL, TEST_SECURITY_CODE, TEST_COGNITO_SESSION_STRING);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminRespondToAuthChallengeCommand, {
            ChallengeName: "SMS_MFA",
            ChallengeResponses: {
                SMS_MFA_CODE: TEST_SECURITY_CODE,
                USERNAME: TEST_EMAIL
            },
            ClientId: TEST_COGNITO_CLIENT_ID,
            UserPoolId: TEST_COGNITO_USER_POOL_ID,
            Session: TEST_COGNITO_SESSION_STRING
        });
    });

    it("sends a AdminInitiateAuthCommand with a refresh token when the useRefreshToken method is called", async () => {
        const cognitoClient = new CognitoClient();
        await cognitoClient.useRefreshToken(TEST_REFRESH_TOKEN);

        expect(mockCognitoClient).toHaveReceivedCommandWith(AdminInitiateAuthCommand, {
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
                REFRESH_TOKEN: TEST_REFRESH_TOKEN
            },
            ClientId: TEST_COGNITO_CLIENT_ID,
            UserPoolId: TEST_COGNITO_USER_POOL_ID
        });
    });
});
