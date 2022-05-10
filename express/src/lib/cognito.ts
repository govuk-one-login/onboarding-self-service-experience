import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    AdminInitiateAuthCommand,
    VerifyUserAttributeCommand,
    GetUserCommand,
    GetUserAttributeVerificationCodeCommand,
    AdminCreateUserCommand,
    RespondToAuthChallengeCommand,
    UpdateUserAttributesCommand,
    AdminUpdateUserAttributesCommand,
    AdminGetUserCommand
} from "@aws-sdk/client-cognito-identity-provider";
import CognitoInterface from "./cognito/CognitoInterface";


export class CognitoClient implements CognitoInterface {
    cognitoClient;
    userPoolId: string | undefined;
    clientId: string | undefined;
    static instance: CognitoClient;

    constructor() {
        this.cognitoClient = new CognitoIdentityProviderClient({
            region: 'eu-west-2',
            endpoint: 'https://cognito-idp.eu-west-2.amazonaws.com'
        });
        this.userPoolId = process.env.USERPOOL_ID;
        this.clientId = process.env.CLIENT_ID;

        if(this.clientId === undefined || this.userPoolId === undefined) {
            console.error(
                `Cannot start application
                
Either USERPOOL_ID or CLIENT_ID has not been set.
                
    USERPOOL_ID=${this.userPoolId}
    CLIENT_ID=${this.clientId}

These values are set using environment variables.  If you are running the application locally the values can be taken from the file .env. You can copy .env.example, rename it and edit the values inside and re-start the application.

If the app is being deployed to PaaS then you may have to update manifest.yaml or provide values in the github environment that you're deploying from.`);
            process.kill(process.pid, 'SIGTERM');
        }
    }

    async createUser(email: string) {
        console.debug(`Adding a user with email ${{email}}`);
        let createUserParams = {
            DesiredDeliveryMediums: [ "EMAIL" ],
            Username: email,
            UserPoolId: this.userPoolId,
            UserAttributes: [
                {Name: "email", Value: email}
            ]
        }
        let command = new AdminCreateUserCommand(createUserParams);
        return await this.cognitoClient.send(command);
    }

    async register(email: string, password: string, phone_number: string) {
        console.debug("Registering ...")
        let signUpParams = {
            ClientId: this.clientId,
            Username: email,
            Password: password,
            UserAttributes: [
                {Name: "email", Value: email},
                {Name: "phone_number", Value: phone_number}]
        }


        let command = new SignUpCommand(signUpParams);
        console.debug("Sending register command to Cognito")
        return await this.cognitoClient.send(command);
    }

    async verify(confirmationCode: string, username: string) {
        let params = {
            UserPoolId: this.userPoolId,
            ClientId: this.clientId,
            ConfirmationCode: confirmationCode,
            Username: username
        }

        let command = new ConfirmSignUpCommand(params);
        return await this.cognitoClient.send(command);
    }

    async login(email: string, password: string) {
        let params = {
            UserPoolId: this.userPoolId,
            ClientId: this.clientId,
            AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        }

        let command = new AdminInitiateAuthCommand(params);
        return await this.cognitoClient.send(command);
    }

    async setNewPassword(email: string, password: string, session: string) {
        let params = {
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ChallengeResponses: {
                "NEW_PASSWORD": password,
                "USERNAME": email
            },
            ClientId: this.clientId,
            Session: session
        }
        let command = new RespondToAuthChallengeCommand(params);
        return await this.cognitoClient.send(command);
    }

    async getUser(username: string) {
        let params = {
            Username: username,
            UserPoolId: this.userPoolId
        }
        let command = new AdminGetUserCommand(params);

        return await this.cognitoClient.send(command);
    }

    async setEmailAsVerified(username: string) {
        let params = {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "email_verified",
                    Value: "true"
                }
            ]
        }
        let command = new AdminUpdateUserAttributesCommand(params);
        return await  this.cognitoClient.send(command);
    }

    async setPhoneNumber(username: string, phoneNumber: string) {
        let params = {
            UserPoolId: this.userPoolId,
            Username: username,
            UserAttributes: [
                {
                    Name: "phone_number",
                    Value: phoneNumber
                }
            ]
        }
        let command = new AdminUpdateUserAttributesCommand(params);
        return await  this.cognitoClient.send(command);
    }

    async sendMobileNumberVerificationCode(accessToken: string) {
        let params = {
            AccessToken: accessToken,
            AttributeName: "phone_number"
        }
        let command = new GetUserAttributeVerificationCodeCommand(params);
        return await this.cognitoClient.send(command);
    }

    async verifySmsCode(accessToken: string, code: string) {
        const params = {
            AccessToken: accessToken,
            AttributeName: 'phone_number',
            Code: code
        }
        let command = new VerifyUserAttributeCommand(params);
        return await this.cognitoClient.send(command);
    }
}

module.exports = {CognitoClient}
