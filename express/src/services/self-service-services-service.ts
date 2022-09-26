import {
    AdminCreateUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminSetUserMFAPreferenceCommandOutput,
    AttributeType,
    AuthenticationResultType,
    GetUserAttributeVerificationCodeCommandOutput,
    MFAOptionType,
    UserStatusType
} from "@aws-sdk/client-cognito-identity-provider";
import {User} from "../../@types/user";
import CognitoInterface from "./cognito/CognitoInterface";
import LambdaFacadeInterface from "./lambda-facade/LambdaFacadeInterface";
import {SelfServiceError} from "../lib/SelfServiceError";
import AuthenticationResultParser from "../lib/AuthenticationResultParser";
import {OnboardingTableItem} from "../../@types/OnboardingTableItem";
import {Service} from "../../@types/Service";
import {unmarshall} from "@aws-sdk/util-dynamodb";

export default class SelfServiceServicesService {
    private cognito: CognitoInterface;
    private lambda: LambdaFacadeInterface;

    constructor(cognito: CognitoInterface, lambda: LambdaFacadeInterface) {
        this.cognito = cognito;
        this.lambda = lambda;
    }

    async changePassword(accessToken: string, previousPassword: string, proposedPassword: string) {
        await this.cognito.changePassword(accessToken, previousPassword, proposedPassword);
    }

    async respondToMfaChallenge(mfaResponsse: MfaResponse, mfaCode: string): Promise<AuthenticationResultType> {
        const response = await this.cognito.respondToMfaChallenge(mfaResponsse.cognitoId, mfaCode, mfaResponsse.cognitoSession);

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
        return response.data.Items[0];
    }

    async login(email: string, password: string): Promise<MfaResponse> {
        const response = await this.cognito.login(email, password);
        return {
            cognitoId: response.ChallengeParameters?.USER_ID_FOR_SRP as string,
            cognitoSession: response.Session as string,
            codeSentTo: response.ChallengeParameters?.CODE_DELIVERY_DESTINATION as string
        };
    }

    async putUser(user: OnboardingTableItem, accessToken: string) {
        // TODO this is somewhere we can simplify types.
        return await this.lambda.putUser(user, accessToken);
    }

    async setNewPassword(emailAddress: string, password: string, cognitoSession: string): Promise<AuthenticationResultType> {
        return (await this.cognito.setNewPassword(emailAddress, password, cognitoSession)).AuthenticationResult as AuthenticationResultType;
    }

    async getUserByEmail(emailAddress: string): Promise<CognitoUser> {
        return await this.cognito.getUser(emailAddress);
    }

    async setEmailAsVerified(emailAddress: string): Promise<void> {
        await this.cognito.setEmailAsVerified(emailAddress);
    }

    async createUser(emailAddress: string): Promise<AdminCreateUserCommandOutput> {
        return await this.cognito.createUser(emailAddress);
    }

    async resendEmailAuthCode(emailAddress: string) {
        return await this.cognito.resendEmailAuthCode(emailAddress);
    }

    async submitUsernamePassword(emailAddress: string, password: string) {
        return await this.cognito.login(emailAddress, password);
    }

    async setPhoneNumber(emailAddress: string, mobileNumber: string) {
        return await this.cognito.setPhoneNumber(emailAddress, mobileNumber);
    }

    async setMfaPreference(cognitoId: string): Promise<AdminSetUserMFAPreferenceCommandOutput> {
        return this.cognito.setMfaPreference(cognitoId);
    }

    async sendMobileNumberVerificationCode(accessToken: string): Promise<GetUserAttributeVerificationCodeCommandOutput> {
        return await this.cognito.sendMobileNumberVerificationCode(accessToken);
    }

    async useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
        return await this.cognito.useRefreshToken(refreshToken);
    }

    async verifyMobileUsingSmsCode(accessToken: string, code: string) {
        return this.cognito.verifyMobileUsingSmsCode(accessToken, code);
    }

    async setMobilePhoneAsVerified(emailAddress: string) {
        return await this.cognito.setMobilePhoneAsVerified(emailAddress);
    }

    async newService(service: Service, user: User, authenticationResult: AuthenticationResultType) {
        const response = await this.lambda.newService(
            service,
            unmarshall(user as Record<string, any>) as User, // this should be unmarshalled when it's stored
            authenticationResult.AccessToken as string
        );
        return JSON.parse(response.data.output);
    }

    async generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<any> {
        return await this.lambda.generateClient(service, authenticationResult);
    }

    async updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: {[key: string]: any},
        accessToken: string
    ): Promise<void> {
        await this.lambda.updateClient(serviceId, selfServiceClientId, clientId, updates, accessToken);
    }

    async privateBetaRequest(yourName: string, department: string, serviceName: string, emailAddress: string, accessToken: string) {
        await this.lambda.privateBetaRequest(yourName, department, serviceName, emailAddress, accessToken as string);
    }

    async listServices(userId: string, accessToken: string) {
        return await this.lambda.listServices(userId, accessToken);
    }

    async updateUser(selfServiceUser: User, updates: {[key: string]: any}, accessToken: string): Promise<void> {
        await this.lambda.updateUser(
            selfServiceUser?.pk.S.substring("user#".length) as string,
            selfServiceUser?.sk.S.substring("cognito_username#".length) as string,
            updates,
            accessToken as string
        );
    }

    async listClients(serviceId: string, accessToken: string) {
        return await this.lambda.listClients(serviceId, accessToken);
    }
}

export interface MfaResponse {
    cognitoSession: string;
    cognitoId: string;
    codeSentTo: string;
}

export interface CognitoUser {
    Username: string | undefined;
    UserAttributes?: AttributeType[];
    UserCreateDate?: Date;
    UserLastModifiedDate?: Date;
    Enabled?: boolean;
    UserStatus?: UserStatusType | string;
    MFAOptions?: MFAOptionType[];
    PreferredMfaSetting?: string;
    UserMFASettingList?: string[];
}
