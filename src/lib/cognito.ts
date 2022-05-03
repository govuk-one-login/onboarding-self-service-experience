import {
    CognitoIdentityProviderClient,
    SignUpCommand,
    ConfirmSignUpCommand,
    AdminInitiateAuthCommand,
    VerifyUserAttributeCommand,
    GetUserCommand,
    GetUserAttributeVerificationCodeCommand,
    AdminCreateUserCommand, RespondToAuthChallengeCommand
} from "@aws-sdk/client-cognito-identity-provider";


export class CognitoClient {
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
        console.error(this.clientId)
        console.error(this.userPoolId)
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
        try {
            let response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("Error creating user:\n" + error);
            return error;
        }
    }

    async register(email: string, password: string, phone_number: string) {
        console.debug("Registering ...")
        let signUpParams = {
            ClientId: '5b5ujvkrkirrqulbq23s1vh5ct',
            Username: email,
            Password: password,
            UserAttributes: [
                {Name: "email", Value: email},
                {Name: "phone_number", Value: phone_number}]
        }


        let command = new SignUpCommand(signUpParams);
        try {
            console.debug("Sending register command to Cognito")
            let response = await this.cognitoClient.send(command);
            return response;
        } catch (error) {
            console.error("Error registering:\n" + error);
            return error;
        }
    }

    async verify(confirmationCode: string, username: string) {
        let params = {
            UserPoolId: this.userPoolId,
            ClientId: '5b5ujvkrkirrqulbq23s1vh5ct',
            ConfirmationCode: confirmationCode,
            Username: username
        }

        let command = new ConfirmSignUpCommand(params);
        let confirmation;
        try {
            confirmation = await this.cognitoClient.send(command);
        } catch (error) {
            console.error(error);
            confirmation = error
        }
        return confirmation;
    }

    async login(email: string, password: string) {
        let params = {
            UserPoolId: this.userPoolId,
            ClientId: '5b5ujvkrkirrqulbq23s1vh5ct',
            AuthFlow: 'ADMIN_USER_PASSWORD_AUTH',
            AuthParameters: {
                USERNAME: email,
                PASSWORD: password
            }
        }

        let command = new AdminInitiateAuthCommand(params);
        try {
            return await this.cognitoClient.send(command);
        } catch (error) {
            console.error(error);
            return error;
        }

    }

    async setNewPassword(email: string, password: string, session: string) {
        let params = {
            ChallengeName: "NEW_PASSWORD_REQUIRED",
            ChallengeResponses: {
                "NEW_PASSWORD": password,
                "USERNAME": email
            },
            ClientId: '5b5ujvkrkirrqulbq23s1vh5ct',
            Session: session
        }
        let command = new RespondToAuthChallengeCommand(params);
        try {
            return await this.cognitoClient.send(command);
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async getUser(accessToken: string) {
        let params = {
            AccessToken: accessToken
        }
        let command = new GetUserCommand(params);
        try {
            return await this.cognitoClient.send(command);
        } catch (error) {
            console.error(error);
            return error;
        }
    }

    async getUserAttributeVerificationCode() {

    }

    async verifyUserAttribute() {
        // const params = {
        //
        // }
        // let command = new VerifyUserAttributeCommand(params);
        // try {
        //     return await this.cognitoClient.send(command);
        // } catch (error) {
        //     console.error(error);
        //     return error;
        // }
    }
}

module.exports = {CognitoClient}
