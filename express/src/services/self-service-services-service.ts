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
        return this.cognito.changePassword(accessToken, previousPassword, proposedPassword);
    }

    forgotPassword(email: string, uri: string): Promise<void> {
        return this.cognito.forgotPassword(email, uri);
    }

    confirmForgotPassword(username: string, password: string, confirmationCode: string): Promise<void> {
        return this.cognito.confirmForgotPassword(username, password, confirmationCode);
    }

    async respondToMfaChallenge(mfaResponse: MfaResponse, mfaCode: string): Promise<AuthenticationResultType> {
        const response = await this.cognito.respondToMfaChallenge(mfaResponse.cognitoId, mfaCode, mfaResponse.cognitoSession);

        if (!response.AuthenticationResult) {
            throw new SelfServiceError("Did not get AuthenticationResult from Cognito");
        }

        return response.AuthenticationResult;
    }

    async getSelfServiceUser(authenticationResult: AuthenticationResultType): Promise<User> {
        if (!authenticationResult.IdToken) {
            throw new SelfServiceError("IdToken not present");
        }

        if (!authenticationResult.AccessToken) {
            throw new SelfServiceError("AccessToken not present");
        }

        const response = await this.lambda.getUserByCognitoId(
            AuthenticationResultParser.getCognitoId(authenticationResult),
            authenticationResult.AccessToken
        );

        return userToDomainUser(response.data.Item as DynamoUser);
    }

    async login(email: string, password: string): Promise<MfaResponse> {
        const response = await this.cognito.login(email, password);

        return {
            cognitoSession: nonNull(response.Session),
            cognitoId: nonNull(response.ChallengeParameters?.USER_ID_FOR_SRP),
            codeSentTo: nonNull(response.ChallengeParameters?.CODE_DELIVERY_DESTINATION)
        };
    }

    putUser(user: OnboardingTableItem, accessToken: string): Promise<void> {
        return this.lambda.putUser(user, accessToken);
    }

    async setNewPassword(emailAddress: string, password: string, cognitoSession: string): Promise<AuthenticationResultType> {
        return nonNull((await this.cognito.setNewPassword(emailAddress, password, cognitoSession)).AuthenticationResult);
    }

    setEmailAsVerified(emailAddress: string): Promise<void> {
        return this.cognito.setEmailAsVerified(emailAddress);
    }

    createUser(emailAddress: string): Promise<void> {
        return this.cognito.createUser(emailAddress);
    }

    resendEmailAuthCode(emailAddress: string): Promise<void> {
        return this.cognito.resendEmailAuthCode(emailAddress);
    }

    submitUsernamePassword(emailAddress: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        return this.cognito.login(emailAddress, password);
    }

    setPhoneNumber(emailAddress: string, mobileNumber: string): Promise<void> {
        return this.cognito.setPhoneNumber(emailAddress, mobileNumber);
    }

    setMfaPreference(cognitoId: string): Promise<void> {
        return this.cognito.setMfaPreference(cognitoId);
    }

    sendMobileNumberVerificationCode(accessToken: string): Promise<void> {
        return this.cognito.sendMobileNumberVerificationCode(accessToken);
    }

    useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
        return this.cognito.useRefreshToken(refreshToken);
    }

    verifyMobileUsingSmsCode(accessToken: string, code: string): Promise<void> {
        return this.cognito.verifyMobileUsingSmsCode(accessToken, code);
    }

    setMobilePhoneAsVerified(emailAddress: string): Promise<void> {
        return this.cognito.setMobilePhoneAsVerified(emailAddress);
    }

    async setSignUpStatus(userName: string, signUpStatusStage: SignupStatusStage): Promise<void> {
        console.log("Setting Sign Up Status Stage =>" + signUpStatusStage);

        const signUpStatus: SignupStatus = await this.getSignUpStatus(userName);
        signUpStatus.setStage(signUpStatusStage, true);

        return await this.cognito.setSignUpStatus(userName, signUpStatus.getState());
    }

    async getSignUpStatus(userName: string): Promise<SignupStatus> {
        const adminGetUserCommandOutput = await this.cognito.adminGetUserCommandOutput(userName);
        const userAttributes = adminGetUserCommandOutput.UserAttributes;

        console.log(JSON.stringify(adminGetUserCommandOutput));
        console.log(JSON.stringify(adminGetUserCommandOutput.UserAttributes));

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
        return this.lambda.newService(
            service,
            userId,
            AuthenticationResultParser.getEmail(authenticationResult),
            nonNull(authenticationResult.AccessToken)
        );
    }

    generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse> {
        return this.lambda.generateClient(service, authenticationResult);
    }

    updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ClientUpdates,
        accessToken: string
    ): Promise<void> {
        return this.lambda.updateClient(serviceId, selfServiceClientId, clientId, updates, accessToken);
    }

    updateService(serviceId: string, updates: ServiceNameUpdates, accessToken: string): Promise<void> {
        return this.lambda.updateService(serviceId, updates, accessToken);
    }

    privateBetaRequest(userName: string, department: string, serviceName: string, emailAddress: string): Promise<void> {
        return this.lambda.privateBetaRequest(userName, department, serviceName, emailAddress);
    }

    async listServices(userId: string): Promise<Service[]> {
        return dynamoServicesToDomainServices((await this.lambda.listServices(userId)).data.Items);
    }

    updateUser(userId: string, updates: UserUpdates, accessToken: string): Promise<void> {
        return this.lambda.updateUser(userId, updates, accessToken);
    }

    async listClients(serviceId: string): Promise<Client[]> {
        const clients = await this.lambda.listClients(serviceId);
        return clients.data.Items?.map(client => dynamoClientToDomainClient(unmarshall(client) as ClientFromDynamo)) ?? [];
    }

    sendTxMALog(body: string): Promise<void> {
        return this.lambda.sendTxMALog(body);
    }
}
