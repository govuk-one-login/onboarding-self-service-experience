import {
    AdminCreateUserCommand,
    AdminInitiateAuthCommand,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommand,
    AdminRespondToAuthChallengeCommandOutput,
    AdminSetUserMFAPreferenceCommand,
    AdminSetUserMFAPreferenceCommandOutput,
    AdminUpdateUserAttributesCommand,
    AdminUpdateUserAttributesCommandOutput,
    ChangePasswordCommand,
    ChangePasswordCommandOutput,
    CognitoIdentityProviderClient,
    GetUserAttributeVerificationCodeCommand,
    GetUserAttributeVerificationCodeCommandOutput,
    RespondToAuthChallengeCommand,
    RespondToAuthChallengeCommandOutput,
    VerifyUserAttributeCommand,
    VerifyUserAttributeCommandOutput,
    ForgotPasswordCommandOutput,
    ForgotPasswordCommand,
    ConfirmForgotPasswordCommandOutput,
    ConfirmForgotPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {AdminCreateUserCommandOutput} from "@aws-sdk/client-cognito-identity-provider/dist-types/commands/AdminCreateUserCommand";
import CognitoInterface from "./CognitoInterface";

/**
 * Uses the [Amazon Cognito API]{@link https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/Welcome.html} to manage users
 * @see [Amazon Cognito documentation]{@link https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html}
 */
export class CognitoClient implements CognitoInterface {
    cognitoClient;
    userPoolId: string | undefined;
    clientId: string | undefined;
    static instance: CognitoClient;

    constructor() {
        this.cognitoClient = new CognitoIdentityProviderClient({
            region: "eu-west-2",
            endpoint: "https://cognito-idp.eu-west-2.amazonaws.com"
        });
        this.userPoolId = process.env.USERPOOL_ID;
        this.clientId = process.env.CLIENT_ID;

        if (this.clientId === undefined || this.userPoolId === undefined) {
            console.error(
                `Cannot start application
                
Either USERPOOL_ID or CLIENT_ID has not been set.
                
    USERPOOL_ID=${this.userPoolId}
    CLIENT_ID=${this.clientId}

These values are set using environment variables.  If you are running the application locally the values can be taken from the file .env. You can copy .env.example, rename it and edit the values inside and re-start the application.

If the app is being deployed to PaaS then you may have to update manifest.yaml or provide values in the github environment that you're deploying from.`
            );
            process.kill(process.pid, "SIGTERM");
        }
    }

    async createUser(email: string): Promise<AdminCreateUserCommandOutput> {
        const createUserParams = {
            DesiredDeliveryMediums: ["EMAIL"],
            Username: email,
            UserPoolId: this.userPoolId,
            TemporaryPassword: Math.floor(Math.random() * 100_000)
                .toString()
                .padStart(6, "0"),
            UserAttributes: [{Name: "email", Value: email}]
        };
        const command = new AdminCreateUserCommand(createUserParams);
        return await this.cognitoClient.send(command);
    }

    async resendEmailAuthCode(email: string): Promise<AdminCreateUserCommandOutput> {
        console.debug(`Re-sending verification code to this address : ${{email}}`);
        const createUserParams = {
            DesiredDeliveryMediums: ["EMAIL"],
            Username: email,
            UserPoolId: this.userPoolId,
            MessageAction: "RESEND",
            TemporaryPassword: Math.floor(Math.random() * 100_000)
                .toString()
                .padStart(6, "0"),
            UserAttributes: [{Name: "email", Value: email}]
        };
        const command = new AdminCreateUserCommand(createUserParams);
        return await this.cognitoClient.send(command);
    }

    async login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        const params = {
            UserPoolId: this.userPoolId,
            ClientId: this.clientId,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        };

        const command = new AdminInitiateAuthCommand(params);
        return await this.cognitoClient.send(command);
    }

    async setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput> {
        const params = {
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ChallengeResponses: {
                NEW_PASSWORD: password,
                USERNAME: email
            },
            ClientId: this.clientId,
            Session: session
        };
        const command = new RespondToAuthChallengeCommand(params);
        return await this.cognitoClient.send(command);
    }

    async changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<ChangePasswordCommandOutput> {
        const params = {
            AccessToken: accessToken,
            PreviousPassword: previousPassword,
            ProposedPassword: proposedPassword
        };
        const command = new ChangePasswordCommand(params);

        return await this.cognitoClient.send(command);
    }

    async forgotPassword(email: string, uri: string): Promise<ForgotPasswordCommandOutput> {
        const params = {
            ClientId: this.clientId,
            Username: email,
            ClientMetadata: {
                uri: uri,
                username: email
            }
        };
        const command = new ForgotPasswordCommand(params);
        return await this.cognitoClient.send(command);
    }

    async confirmForgotPassword(username: string, password: string, confirmationCode: string): Promise<ConfirmForgotPasswordCommandOutput> {
        const params = {
            ClientId: this.clientId,
            Username: username,
            Password: password,
            ConfirmationCode: confirmationCode,
            ClientMetadata: {
                email: username
            }
        };
        const command = new ConfirmForgotPasswordCommand(params);
        return await this.cognitoClient.send(command);
    }

    async setEmailAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        const params = {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "email_verified",
                    Value: "true"
                }
            ]
        };
        const command = new AdminUpdateUserAttributesCommand(params);
        return await this.cognitoClient.send(command);
    }

    async setMobilePhoneAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        const params = {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "phone_number_verified",
                    Value: "true"
                }
            ]
        };
        const command = new AdminUpdateUserAttributesCommand(params);
        return await this.cognitoClient.send(command);
    }

    async setPhoneNumber(username: string, phoneNumber: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        const params = {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "phone_number",
                    Value: phoneNumber
                }
            ]
        };
        const command = new AdminUpdateUserAttributesCommand(params);
        return await this.cognitoClient.send(command);
    }

    async sendMobileNumberVerificationCode(accessToken: string): Promise<GetUserAttributeVerificationCodeCommandOutput> {
        const params = {
            AccessToken: accessToken,
            AttributeName: "phone_number"
        };
        const command = new GetUserAttributeVerificationCodeCommand(params);
        return await this.cognitoClient.send(command);
    }

    /**
     * {@link https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_VerifyUserAttribute.html VerifyUserAttribute}
     */
    async verifyMobileUsingSmsCode(accessToken: string, code: string): Promise<VerifyUserAttributeCommandOutput> {
        const params = {
            AccessToken: accessToken,
            AttributeName: "phone_number",
            Code: code
        };
        const command = new VerifyUserAttributeCommand(params);
        return await this.cognitoClient.send(command);
    }

    async setMfaPreference(cognitoUsername: string): Promise<AdminSetUserMFAPreferenceCommandOutput> {
        const params = {
            SMSMfaSettings: {
                Enabled: true,
                PreferredMfa: true
            },
            Username: cognitoUsername,
            UserPoolId: this.userPoolId
        };
        const command = new AdminSetUserMFAPreferenceCommand(params);
        return await this.cognitoClient.send(command);
    }

    async respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AdminRespondToAuthChallengeCommandOutput> {
        const params = {
            ChallengeName: "SMS_MFA",
            ChallengeResponses: {
                SMS_MFA_CODE: mfaCode,
                USERNAME: username
            },
            ClientId: this.clientId,
            UserPoolId: this.userPoolId,
            Session: session
        };
        const command = new AdminRespondToAuthChallengeCommand(params);
        return await this.cognitoClient.send(command);
    }

    async useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
        const params = {
            UserPoolId: this.userPoolId,
            ClientId: this.clientId,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
                REFRESH_TOKEN: refreshToken
            }
        };
        const command = new AdminInitiateAuthCommand(params);
        return await this.cognitoClient.send(command);
    }
}

module.exports = {CognitoClient};
