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
    GlobalSignOutCommand,
    GetUserCommand,
    VerifyUserAttributeCommand,
    UpdateUserPoolClientCommand,
    AdminSetUserPasswordCommand
} from "@aws-sdk/client-cognito-identity-provider";
import {Command} from "@aws-sdk/types";
import {cognito, region} from "../../config/environment";
import CognitoInterface from "./CognitoInterface";
import console from "console";
import {fixedOTPInitialise, getFixedOTPTemporaryPassword, isFixedCredential, verifyMobileUsingOTPCode} from "../../lib/fixedOTPSupport";

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

        // Update the MFA Duration Status from default of 3 Minutes to 15 Minutes (the maximum)
        const updateUserPoolClientCommand = new UpdateUserPoolClientCommand({
            ClientId: this.clientId,
            UserPoolId: this.userPoolId,
            AuthSessionValidity: 15,
            ExplicitAuthFlows: ["ALLOW_ADMIN_USER_PASSWORD_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
        });

        this.client.send(updateUserPoolClientCommand);

        // Initialise OTP Credentials
        if (process.env.USE_STUB_OTP == "true") {
            fixedOTPInitialise();
        }
    }

    async createUser(email: string): Promise<void> {
        console.log("In CognitoClient:createUser");

        let temporaryPassword: string;

        if (isFixedCredential(email)) {
            temporaryPassword = getFixedOTPTemporaryPassword(email);
        } else {
            temporaryPassword = Math.floor(Math.random() * 100_000)
                .toString()
                .padStart(6, "0");
        }

        await this.sendCommand(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            Username: email,
            UserPoolId: this.userPoolId,
            TemporaryPassword: temporaryPassword,
            UserAttributes: [
                {Name: "email", Value: email},
                {Name: "custom:signup_status", Value: ""}
            ]
        });
        console.log("Exit createUser");
    }

    async recoverUser(email: string): Promise<void> {
        console.log("In CognitoClient:recoverUser");

        await this.sendCommand(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            MessageAction: "SUPPRESS",
            Username: email,
            UserPoolId: this.userPoolId,
            TemporaryPassword: Math.floor(Math.random() * 100_000)
                .toString()
                .padStart(6, "0"),
            UserAttributes: [
                {Name: "email", Value: email},
                {Name: "custom:signup_status", Value: "HasEmail,HasPassword,HasPhoneNumber,HasTextCode"}
            ]
        });
    }

    async resendEmailAuthCode(email: string): Promise<void> {
        console.info("In CognitoClient:resendEmailAuthCode()");

        let temporaryPassword: string;

        if (isFixedCredential(email)) {
            temporaryPassword = getFixedOTPTemporaryPassword(email);
        } else {
            temporaryPassword = Math.floor(Math.random() * 100_000)
                .toString()
                .padStart(6, "0");
        }

        await this.sendCommand(AdminCreateUserCommand, {
            DesiredDeliveryMediums: ["EMAIL"],
            Username: email,
            UserPoolId: this.userPoolId,
            MessageAction: "RESEND",
            TemporaryPassword: temporaryPassword,
            UserAttributes: [{Name: "email", Value: email}]
        });
    }

    login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        console.info("In CognitoClient:login()");

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

    async globalSignOut(accessToken: string): Promise<AdminInitiateAuthCommandOutput> {
        return await this.sendCommand(GlobalSignOutCommand, {
            AccessToken: accessToken
        });
    }

    async getUser(accessToken: string): Promise<AdminInitiateAuthCommandOutput> {
        return await this.sendCommand(GetUserCommand, {
            AccessToken: accessToken
        });
    }

    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput> {
        console.info("In CognitoClient:setNewPassword()");

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
        console.info("In CognitoClient:changePassword()");

        await this.sendCommand(ChangePasswordCommand, {
            AccessToken: accessToken,
            PreviousPassword: previousPassword,
            ProposedPassword: proposedPassword
        });
    }

    async forgotPassword(email: string, protocol: string, host: string, useRecoveredAccountURL: boolean): Promise<void> {
        console.info("In CognitoClient:forgotPassword()");

        await this.sendCommand(ForgotPasswordCommand, {
            ClientId: this.clientId,
            Username: email,
            ClientMetadata: {
                protocol,
                host: host.split("").join("/"),
                username: email,
                use_recovered_account_url: useRecoveredAccountURL ? "true" : "false"
            }
        });
    }

    async confirmForgotPassword(username: string, password: string, confirmationCode: string): Promise<void> {
        console.info("In CognitoClient:confirmForgotPassword()");

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

    async setUserPassword(userName: string, password: string): Promise<void> {
        console.info("In CognitoClient:setUserPassword()");

        await this.sendCommand(AdminSetUserPasswordCommand, {
            Password: password,
            Permanent: true,
            Username: userName,
            UserPoolId: this.userPoolId
        });
    }

    async setEmailAsVerified(username: string): Promise<void> {
        console.info("In CognitoClient:setEmailVerified()");

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
        console.info("In CognitoClient:setSignUpStatus()");
        console.info("Setting Status => " + status);

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
        console.info("In CognitoClient:adminGetUserCommandOutput()");

        const command = new AdminGetUserCommand({
            UserPoolId: this.userPoolId,
            Username: userName
        });

        return this.client.send(command);
    }

    async setMobilePhoneAsVerified(username: string): Promise<void> {
        console.info("In CognitoClient:setMobilePhoneAsVerified()");

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
        console.info("In CognitoClient:setPhoneNumber()");

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
        console.info("In CognitoClient:sendMobileNumberVerification()");

        await this.sendCommand(GetUserAttributeVerificationCodeCommand, {
            AccessToken: accessToken,
            AttributeName: "phone_number"
        });
    }

    /**
     * {@link https://docs.aws.amazon.com/cognito-user-identity-pools/latest/APIReference/API_VerifyUserAttribute.html VerifyUserAttribute}
     */
    async verifyMobileUsingSmsCode(accessToken: string, code: string, emailAddress: string): Promise<void> {
        console.info("In CognitoClient:verifyMobileUsingSmsCode()");

        if (isFixedCredential(emailAddress)) {
            verifyMobileUsingOTPCode(emailAddress, code);
        } else {
            await this.sendCommand(VerifyUserAttributeCommand, {
                AccessToken: accessToken,
                AttributeName: "phone_number",
                Code: code
            });
        }
    }

    async setMfaPreference(cognitoUsername: string): Promise<void> {
        console.info("In CognitoClient:setMfaPreference()");

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
        console.info("In CognitoClient:respondToMfaChallenge()");

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
        console.info("In CognitoClient:useRefreshToken()");

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
