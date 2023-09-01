import {
    AdminCreateUserCommand,
    AdminGetUserCommand,
    AdminGetUserCommandOutput,
    AdminInitiateAuthCommand,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommand,
    AdminRespondToAuthChallengeCommandOutput,
    AdminSetUserMFAPreferenceCommand,
    AdminUpdateUserAttributesCommand,
    ChangePasswordCommand,
    CognitoIdentityProviderClient,
    CognitoIdentityProviderClientResolvedConfig,
    ConfirmForgotPasswordCommand,
    ForgotPasswordCommand,
    GetUserAttributeVerificationCodeCommand,
    RespondToAuthChallengeCommand,
    RespondToAuthChallengeCommandOutput,
    ServiceInputTypes,
    ServiceOutputTypes,
    VerifyUserAttributeCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {Command} from "@aws-sdk/types";
import {cognito, region} from "../../config/environment";
import CognitoInterface from "./CognitoInterface";

type CognitoCommand<Input extends ServiceInputTypes, Output extends ServiceOutputTypes> = Command<
    ServiceInputTypes,
    Input,
    ServiceOutputTypes,
    Output,
    CognitoIdentityProviderClientResolvedConfig
>;

/**
 * Uses the [Amazon Cognito API]{@link https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/Welcome.html} to manage users
 * @see [Amazon Cognito documentation]{@link https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html}
 */
export default class CognitoClient implements CognitoInterface {
    private readonly userPoolId;
    private readonly clientId;
    private readonly client;

    constructor() {
        console.log("Creating Cognito client...");
        this.clientId = nonNull(cognito.clientId);
        this.userPoolId = nonNull(cognito.userPoolId);
        this.client = new CognitoIdentityProviderClient({region: region});
    }

    async createUser(email: string): Promise<void> {
        console.log("In createUser");
        await this.sendCommand(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            Username: email,
            UserPoolId: this.userPoolId,
            TemporaryPassword: Math.floor(Math.random() * 100_000)
                .toString()
                .padStart(6, "0"),
            UserAttributes: [
                {Name: "email", Value: email},
                {Name: "custom:signup_status", Value: ""}
            ]
        });
        console.log("Exit createUser");
    }

    async resendEmailAuthCode(email: string): Promise<void> {
        await this.sendCommand(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            Username: email,
            UserPoolId: this.userPoolId,
            MessageAction: "RESEND",
            TemporaryPassword: Math.floor(Math.random() * 100_000)
                .toString()
                .padStart(6, "0"),
            UserAttributes: [{Name: "email", Value: email}]
        });
    }

    login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        return this.sendCommand(AdminInitiateAuthCommand, {
            UserPoolId: this.userPoolId,
            ClientId: this.clientId,
            AuthFlow: "ADMIN_USER_PASSWORD_AUTH",
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        });
    }

    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput> {
        return this.sendCommand(RespondToAuthChallengeCommand, {
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ChallengeResponses: {
                NEW_PASSWORD: password,
                USERNAME: email
            },
            ClientId: this.clientId,
            Session: session
        });
    }

    async changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<void> {
        await this.sendCommand(ChangePasswordCommand, {
            AccessToken: accessToken,
            PreviousPassword: previousPassword,
            ProposedPassword: proposedPassword
        });
    }

    async forgotPassword(email: string, uri: string): Promise<void> {
        await this.sendCommand(ForgotPasswordCommand, {
            ClientId: this.clientId,
            Username: email,
            ClientMetadata: {
                uri: uri,
                username: email
            }
        });
    }

    async confirmForgotPassword(username: string, password: string, confirmationCode: string): Promise<void> {
        await this.sendCommand(ConfirmForgotPasswordCommand, {
            ClientId: this.clientId,
            Username: username,
            Password: password,
            ConfirmationCode: confirmationCode,
            ClientMetadata: {
                email: username
            }
        });
    }

    async setEmailAsVerified(username: string): Promise<void> {
        await this.sendCommand(AdminUpdateUserAttributesCommand, {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "email_verified",
                    Value: "true"
                }
            ]
        });
    }

    async setSignUpStatus(username: string, status: string): Promise<void> {
        await this.sendCommand(AdminUpdateUserAttributesCommand, {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "custom:signup_status",
                    Value: status
                }
            ]
        });
    }

    async adminGetUserCommandOutput(userName: string): Promise<AdminGetUserCommandOutput> {
        const command = new AdminGetUserCommand({
            UserPoolId: this.userPoolId,
            Username: userName
        });

        return this.client.send(command);
    }

    async setMobilePhoneAsVerified(username: string): Promise<void> {
        await this.sendCommand(AdminUpdateUserAttributesCommand, {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "phone_number_verified",
                    Value: "true"
                }
            ]
        });
    }

    async setPhoneNumber(username: string, phoneNumber: string): Promise<void> {
        await this.sendCommand(AdminUpdateUserAttributesCommand, {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "phone_number",
                    Value: phoneNumber
                }
            ]
        });
    }

    async sendMobileNumberVerificationCode(accessToken: string): Promise<void> {
        await this.sendCommand(GetUserAttributeVerificationCodeCommand, {
            AccessToken: accessToken,
            AttributeName: "phone_number"
        });
    }

    /**
     * {@link https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_VerifyUserAttribute.html VerifyUserAttribute}
     */
    async verifyMobileUsingSmsCode(accessToken: string, code: string): Promise<void> {
        await this.sendCommand(VerifyUserAttributeCommand, {
            AccessToken: accessToken,
            AttributeName: "phone_number",
            Code: code
        });
    }

    async setMfaPreference(cognitoUsername: string): Promise<void> {
        await this.sendCommand(AdminSetUserMFAPreferenceCommand, {
            SMSMfaSettings: {
                Enabled: true,
                PreferredMfa: true
            },
            Username: cognitoUsername,
            UserPoolId: this.userPoolId
        });
    }

    respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AdminRespondToAuthChallengeCommandOutput> {
        return this.sendCommand(AdminRespondToAuthChallengeCommand, {
            ChallengeName: "SMS_MFA",
            ChallengeResponses: {
                SMS_MFA_CODE: mfaCode,
                USERNAME: username
            },
            ClientId: this.clientId,
            UserPoolId: this.userPoolId,
            Session: session
        });
    }

    useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
        return this.sendCommand(AdminInitiateAuthCommand, {
            UserPoolId: this.userPoolId,
            ClientId: this.clientId,
            AuthFlow: "REFRESH_TOKEN_AUTH",
            AuthParameters: {
                REFRESH_TOKEN: refreshToken
            }
        });
    }

    private sendCommand<Input extends ServiceInputTypes, Output extends ServiceOutputTypes>(
        commandConstructor: new (input: Input) => CognitoCommand<Input, Output>,
        commandInput: Input
    ): Promise<ServiceOutputTypes> {
        return this.client.send(new commandConstructor(commandInput));
    }
}
