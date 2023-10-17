import {AdminInitiateAuthCommandOutput, AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {unmarshall} from "@aws-sdk/util-dynamodb";
import {AxiosResponse} from "axios";
import {Client, ClientFromDynamo} from "../../@types/client";
import {OnboardingTableItem} from "../../@types/OnboardingTableItem";
import {Service} from "../../@types/Service";
import {DynamoUser, User} from "../../@types/user";
import AuthenticationResultParser from "../lib/authentication-result-parser";
import SelfServiceError from "../lib/errors";
import {dynamoClientToDomainClient} from "../lib/models/client-utils";
import {dynamoServicesToDomainServices} from "../lib/models/service-utils";
import {userToDomainUser} from "../lib/models/user-utils";
import MfaResponse from "../types/mfa-response";
import CognitoInterface from "./cognito/CognitoInterface";
import LambdaFacadeInterface, {ClientUpdates, ServiceNameUpdates, UserUpdates} from "./lambda-facade/LambdaFacadeInterface";
import {SignupStatus, SignupStatusStage} from "../lib/utils/signup-status";
import console from "console";

export default class SelfServiceServicesService {
    private cognito: CognitoInterface;
    private lambda: LambdaFacadeInterface;

    constructor(cognito: CognitoInterface, lambda: LambdaFacadeInterface) {
        this.cognito = cognito;
        this.lambda = lambda;
    }

    changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<void> {
        console.info("In self-service-services-service:changePassword()");

        return this.cognito.changePassword(accessToken, previousPassword, proposedPassword);
    }

    forgotPassword(email: string, protocol: string, host: string): Promise<void> {
        console.info("In self-service-services-service:forgotPassword()");

        return this.cognito.forgotPassword(email, protocol, host);
    }

    confirmForgotPassword(username: string, password: string, confirmationCode: string): Promise<void> {
        console.info("In self-service-services-service:confirmForgotPassword()");

        return this.cognito.confirmForgotPassword(username, password, confirmationCode);
    }

    async respondToMfaChallenge(mfaResponse: MfaResponse, mfaCode: string): Promise<AuthenticationResultType> {
        console.info("In self-service-services-service:respondToMfaChallenge()");

        const response = await this.cognito.respondToMfaChallenge(mfaResponse.cognitoId, mfaCode, mfaResponse.cognitoSession);

        if (!response.AuthenticationResult) {
            throw new SelfServiceError("Did not get AuthenticationResult from Cognito");
        }

        return response.AuthenticationResult;
    }

    async getSelfServiceUser(authenticationResult: AuthenticationResultType): Promise<User> {
        console.info("In self-service-services-service:getSelfServiceUser()");

        if (!authenticationResult.IdToken) {
            throw new SelfServiceError("IdToken not present");
        }

        if (!authenticationResult.AccessToken) {
            throw new SelfServiceError("AccessToken not present");
        }

        await this.validateToken(authenticationResult.AccessToken, "getSelfServiceUser");
        const response = await this.lambda.getUserByCognitoId(
            AuthenticationResultParser.getCognitoId(authenticationResult),
            authenticationResult.AccessToken
        );

        return userToDomainUser(response.data.Item as DynamoUser);
    }

    async login(email: string, password: string): Promise<MfaResponse> {
        console.info("In self-service-services-service:login()");

        const response = await this.cognito.login(email, password);

        return {
            cognitoSession: nonNull(response.Session),
            cognitoId: nonNull(response.ChallengeParameters?.USER_ID_FOR_SRP),
            codeSentTo: nonNull(response.ChallengeParameters?.CODE_DELIVERY_DESTINATION)
        };
    }

    async putUser(user: OnboardingTableItem, accessToken: string): Promise<void> {
        console.info("In self-service-services-service:putUser()");
        await this.validateToken(accessToken, "putUser");
        return this.lambda.putUser(user, accessToken);
    }

    async setNewPassword(emailAddress: string, password: string, cognitoSession: string): Promise<AuthenticationResultType> {
        console.info("In self-service-services-service:setNewPassword()");

        return nonNull((await this.cognito.setNewPassword(emailAddress, password, cognitoSession)).AuthenticationResult);
    }

    setEmailAsVerified(emailAddress: string): Promise<void> {
        console.info("In self-service-services-service:setEmailAsVerified()");

        return this.cognito.setEmailAsVerified(emailAddress);
    }

    createUser(emailAddress: string): Promise<void> {
        console.info("In self-service-services-service:createUser()");

        return this.cognito.createUser(emailAddress);
    }

    resendEmailAuthCode(emailAddress: string): Promise<void> {
        console.info("In self-service-services-service:resendEmailAuthCode()");

        return this.cognito.resendEmailAuthCode(emailAddress);
    }

    submitUsernamePassword(emailAddress: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        console.info("In self-service-services-service:submitUsernamePassword()");

        return this.cognito.login(emailAddress, password);
    }

    setPhoneNumber(emailAddress: string, mobileNumber: string): Promise<void> {
        console.info("In self-service-services-service:setPhoneNumber()");

        return this.cognito.setPhoneNumber(emailAddress, mobileNumber);
    }

    setMfaPreference(cognitoId: string): Promise<void> {
        console.info("In self-service-services-service:setMfaPreference()");

        return this.cognito.setMfaPreference(cognitoId);
    }

    sendMobileNumberVerificationCode(accessToken: string): Promise<void> {
        console.info("In self-service-services-service:sendMobileVerificationCode()");

        return this.cognito.sendMobileNumberVerificationCode(accessToken);
    }

    useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
        console.info("In self-service-services-service:useRefreshToken()");

        return this.cognito.useRefreshToken(refreshToken);
    }

    verifyMobileUsingSmsCode(accessToken: string, code: string): Promise<void> {
        console.info("In self-service-services-service:verifyMobileUsingSmsCode()");

        return this.cognito.verifyMobileUsingSmsCode(accessToken, code);
    }

    setMobilePhoneAsVerified(emailAddress: string): Promise<void> {
        console.info("In self-service-services-service:setMobilePhoneAsVerified()");

        return this.cognito.setMobilePhoneAsVerified(emailAddress);
    }

    async setSignUpStatus(userName: string, signUpStatusStage: SignupStatusStage): Promise<void> {
        console.log("Setting Sign Up Status Stage =>" + signUpStatusStage);

        const signUpStatus: SignupStatus = await this.getSignUpStatus(userName);
        signUpStatus.setStage(signUpStatusStage, true);

        return await this.cognito.setSignUpStatus(userName, signUpStatus.getState());
    }

    async getSignUpStatus(userName: string): Promise<SignupStatus> {
        console.info("In self-service-services-service:getSignUpStatus()");

        const adminGetUserCommandOutput = await this.cognito.adminGetUserCommandOutput(userName);
        const userAttributes = adminGetUserCommandOutput.UserAttributes;

        if (userAttributes == null) {
            throw new Error("Unable to get Sign Up Status Custom Attribute");
        } else {
            let signUpStatusAttributeValue = "";

            userAttributes.forEach(attribute => {
                if (attribute.Name == "custom:signup_status") {
                    signUpStatusAttributeValue = attribute.Value as string;
                }
            });

            const signUpStatus = new SignupStatus();
            signUpStatus.setState(signUpStatusAttributeValue);

            return signUpStatus;
        }
    }

    async newService(service: Service, userId: string, authenticationResult: AuthenticationResultType): Promise<void> {
        console.info("In self-service-services-service:newService()");
        await this.validateToken(nonNull(authenticationResult.AccessToken), "newService");

        return this.lambda.newService(
            service,
            userId,
            AuthenticationResultParser.getEmail(authenticationResult),
            nonNull(authenticationResult.AccessToken)
        );
    }

    async generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse> {
        console.info("In self-service-services-service:generateClient");
        await this.validateToken(nonNull(authenticationResult.AccessToken), "generateClient");
        return this.lambda.generateClient(service, authenticationResult);
    }

    async updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ClientUpdates,
        accessToken: string
    ): Promise<void> {
        console.info("In self-service-services-service:updateClient()");
        await this.validateToken(accessToken, "updateClient");
        return this.lambda.updateClient(serviceId, selfServiceClientId, clientId, updates, accessToken);
    }

    async updateService(serviceId: string, updates: ServiceNameUpdates, accessToken: string): Promise<void> {
        console.info("In self-service-services-service:updateService()");
        await this.validateToken(accessToken, "updateService");
        return this.lambda.updateService(serviceId, updates, accessToken);
    }

    private async validateToken(accessToken: string, message: string) {
        try {
            const userData = await this.cognito.getUser(accessToken);
            if (userData.$metadata.httpStatusCode != 200) {
                console.log(`validateToken() ${message} - Invalid token, HTTP response code: ` + userData.$metadata.httpStatusCode);
                throw new Error(`validateToken() ${message} - Invalid token, HTTP response code: ` + userData.$metadata.httpStatusCode);
            }
            console.log(`validateToken() ${message}  - token is valid`);
        } catch (e) {
            console.log(`validateToken() ${message} - invalid token, exception ` + JSON.stringify(e, null, 4));
            throw e;
        }
    }

    async publicBetaRequest(
        userName: string,
        department: string,
        serviceName: string,
        emailAddress: string,
        accessToken: string
    ): Promise<void> {
        console.info("In self-service-services-service:betaRequest()");
        await this.validateToken(accessToken, "privateBetaRequest");
        return this.lambda.publicBetaRequest(userName, department, serviceName, emailAddress);
    }

    async listServices(userId: string, accessToken: string): Promise<Service[]> {
        console.info("In self-service-services-service:listServices()");
        await this.validateToken(accessToken, "listServices");
        return dynamoServicesToDomainServices((await this.lambda.listServices(userId)).data.Items);
    }

    async updateUser(userId: string, updates: UserUpdates, accessToken: string): Promise<void> {
        console.info("In self-service-services-service:updateUser()");
        await this.validateToken(accessToken, "updateUser");
        return this.lambda.updateUser(userId, updates, accessToken);
    }

    async listClients(serviceId: string, accessToken: string): Promise<Client[]> {
        console.info("In self-service-services-service:listClients()");
        await this.validateToken(accessToken, "listClients");
        const clients = await this.lambda.listClients(serviceId);
        return clients.data.Items?.map(client => dynamoClientToDomainClient(unmarshall(client) as ClientFromDynamo)) ?? [];
    }

    async globalSignOut(userEmail: string, accessToken: string): Promise<AxiosResponse> {
        await this.cognito.globalSignOut(accessToken);
        return this.lambda.globalSignOut(userEmail);
    }

    async sessionCount(userEmail: string): Promise<number> {
        return (await this.lambda.sessionCount(userEmail)).data.sessionCount;
    }

    sendTxMALog(body: string): Promise<void> {
        return this.lambda.sendTxMALog(body);
    }
}
