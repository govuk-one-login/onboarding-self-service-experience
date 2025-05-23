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
import {domainUserToDynamoUser, userToDomainUser} from "../lib/models/user-utils";
import MfaResponse from "../types/mfa-response";
import CognitoInterface from "./cognito/CognitoInterface";
import LambdaFacadeInterface, {ClientUpdates, ServiceNameUpdates, UserUpdates} from "./lambda-facade/LambdaFacadeInterface";
import {SignupStatus, SignupStatusStage} from "../lib/utils/signup-status";
import console from "console";
import {Request} from "express";
import {TxMAEvent, TxMAExtension, TxMAUser} from "../types/txma-event";
import SheetsService from "../lib/sheets/SheetsService";
import {v4 as uuid_4} from "uuid";

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

    forgotPassword(email: string, protocol: string, host: string, useRecoveredAccountURL: boolean): Promise<void> {
        console.info("In self-service-services-service:forgotPassword()");

        return this.cognito.forgotPassword(email, protocol, host, useRecoveredAccountURL);
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

        try {
            const response = await this.cognito.login(email, password);

            return {
                cognitoSession: nonNull(response.Session),
                cognitoId: nonNull(response.ChallengeParameters?.USER_ID_FOR_SRP),
                codeSentTo: nonNull(response.ChallengeParameters?.CODE_DELIVERY_DESTINATION)
            };
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
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

    resetMfaPreference(cognitoId: string): Promise<void> {
        console.info("In self-service-services-service:resetMfaPreference()");

        return this.cognito.resetMfaPreference(cognitoId);
    }

    sendMobileNumberVerificationCode(accessToken: string): Promise<void> {
        console.info("In self-service-services-service:sendMobileVerificationCode()");

        return this.cognito.sendMobileNumberVerificationCode(accessToken);
    }

    useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
        console.info("In self-service-services-service:useRefreshToken()");

        return this.cognito.useRefreshToken(refreshToken);
    }

    verifyMobileUsingSmsCode(accessToken: string, code: string, emailAddress: string): Promise<void> {
        console.info("In self-service-services-service:verifyMobileUsingSmsCode()");

        return this.cognito.verifyMobileUsingSmsCode(accessToken, code, emailAddress);
    }

    setMobilePhoneAsVerified(emailAddress: string): Promise<void> {
        console.info("In self-service-services-service:setMobilePhoneAsVerified()");

        return this.cognito.setMobilePhoneAsVerified(emailAddress);
    }

    async setSignUpStatus(userName: string, signUpStatusStage: SignupStatusStage): Promise<void> {
        console.info("In self-service-services-service:setSignUpStatus()");

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

    async updateService(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ServiceNameUpdates,
        accessToken: string
    ): Promise<void> {
        console.info("In self-service-services-service:updateService()");
        await this.validateToken(accessToken, "updateService");
        return this.lambda.updateService(serviceId, selfServiceClientId, clientId, updates, accessToken);
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

    async listServices(userId: string, accessToken: string): Promise<Service[]> {
        console.info("In self-service-services-service:listServices()");
        await this.validateToken(accessToken, "listServices");
        return dynamoServicesToDomainServices((await this.lambda.listServices(userId, accessToken)).data.Items);
    }

    async updateUser(userId: string, updates: UserUpdates, accessToken: string): Promise<void> {
        console.info("In self-service-services-service:updateUser()");
        await this.validateToken(accessToken, "updateUser");
        return this.lambda.updateUser(userId, updates, accessToken);
    }

    async listClients(serviceId: string, accessToken: string): Promise<Client[]> {
        console.info("In self-service-services-service:listClients()");
        await this.validateToken(accessToken, "listClients");
        const clients = await this.lambda.listClients(serviceId, accessToken);
        return clients.data.Items?.map(client => dynamoClientToDomainClient(unmarshall(client) as ClientFromDynamo)) ?? [];
    }

    async globalSignOut(userEmail: string, accessToken: string): Promise<AxiosResponse> {
        await this.validateToken(accessToken, "Global sign out");
        await this.cognito.globalSignOut(accessToken);
        return this.lambda.globalSignOut(userEmail);
    }

    async sessionCount(userEmail: string): Promise<number> {
        return (await this.lambda.sessionCount(userEmail)).data.sessionCount;
    }

    private getTimestamp(): string {
        const pad = (n: number, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
        const d = new Date();

        return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
            d.getSeconds()
        )}.${pad(d.getMilliseconds(), 3)}`;
    }

    async updateUserSpreadsheet(userEmail: string, userPhone: string, serviceName: string): Promise<void> {
        const values = new Map<string, string>();
        values.set("id", uuid_4());
        values.set("submission-date", this.getTimestamp());
        values.set("user-email", userEmail);
        values.set("user-phone", userPhone);
        values.set("service-name", serviceName);

        const sheetsService: SheetsService = new SheetsService(process.env.USER_SIGNUP_SHEET_ID as string);
        await sheetsService.init().catch(error => console.error("updateUserSpreadsheet: " + error));
        await sheetsService
            .appendValues(values, process.env.USER_SIGNUP_SHEET_DATA_RANGE as string, process.env.USER_SIGNUP_SHEET_HEADER_RANGE as string)
            .then(() => console.log("Saved to sheets"))
            .catch(reason => {
                console.error("updateUserSpreadsheet: " + reason);
            });
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Error handling middleware must take 4 arguments
    sendTxMALog(eventName: string, user: TxMAUser, extensions: TxMAExtension | undefined = undefined) {
        const txmaEvent: TxMAEvent = {
            timestamp: Math.floor(Date.now() / 1000),
            event_name: eventName,
            component_id: "SSE",
            user: user,
            extensions: extensions
        };

        // eslint-disable-next-line @typescript-eslint/no-unused-vars -- Error handling middleware must take 4 arguments
        this.lambda.sendTxMALog(txmaEvent).then(
            () => {
                return;
            },
            error => {
                console.error("sendTxMALog errored: " + error);
            }
        );
    }

    getDynamoDBEntries(email: string) {
        console.log("In self-service-services-service-getDynamoDBEntries");
        return this.lambda.getDynamoDBEntries(email);
    }

    async recoverCognitoAccount(req: Request, userEmail: string, password: string, mobileNumber: string) {
        console.info("In self-service-services-service:recoverCognitoAccount()");

        await this.cognito.recoverUser(userEmail);
        await this.cognito.setEmailAsVerified(userEmail);
        await this.cognito.setUserPassword(userEmail, password);
        await this.cognito.setPhoneNumber(userEmail, mobileNumber);
        await this.cognito.setMobilePhoneAsVerified(userEmail);
        await this.cognito.setMfaPreference(userEmail);

        req.session.mfaResponse = await this.login(userEmail, password);
    }

    async recreateDynamoDBAccountLinks(authenticationResult: AuthenticationResultType, oldUserID: string) {
        console.info("In self-service-services-service:createNewDynamoDBAccountLinks()");
        const accessToken = nonNull(authenticationResult.AccessToken);
        await this.validateToken(accessToken, "recreateDynamoDBAccountLinks");

        const serviceListToReplicate = dynamoServicesToDomainServices((await this.lambda.listServices(oldUserID, accessToken)).data.Items);

        for (const serviceItem of serviceListToReplicate) {
            const serviceID: string = serviceItem.id;
            const serviceName: string = serviceItem.serviceName;
            const currentUserID = AuthenticationResultParser.getCognitoId(authenticationResult);
            const emailAddress = AuthenticationResultParser.getEmail(authenticationResult);
            const mobileNumber = AuthenticationResultParser.getPhoneNumber(authenticationResult);

            const dynamoUser = domainUserToDynamoUser({
                id: currentUserID,
                fullName: "we haven't collected this full name",
                firstName: "we haven't collected this first name",
                lastName: "we haven't collected this last name",
                email: emailAddress,
                mobileNumber: mobileNumber,
                passwordLastUpdated: new Date().toLocaleDateString() // This is correct as we have just created the Cognito Record with a Password.
            });

            const service: Service = {
                id: `service#${serviceID}`,
                serviceName: serviceName
            };

            await this.putUser(dynamoUser, accessToken);
            await this.newService(service, currentUserID, authenticationResult);
            await this.lambda.deleteClientEntries(oldUserID, serviceID, accessToken);
        }
    }

    async deleteServiceEntries(serviceID: string, accessToken: string) {
        console.info("In self-service-services-service:deleteServiceEntries()");
        console.log("Service ID => " + serviceID);
        await this.validateToken(accessToken, "deleteServiceEntries");
        await this.lambda.deleteServiceEntries(serviceID, accessToken);
    }

    async getEmailCodeBlock(email: string): Promise<boolean> {
        return this.lambda.getEmailCodeBlock(email);
    }

    async putEmailCodeBlock(email: string): Promise<void> {
        await this.lambda.putEmailCodeBlock(email);
    }

    async removeEmailCodeBlock(email: string): Promise<void> {
        await this.lambda.removeEmailCodeBlock(email);
    }
}
