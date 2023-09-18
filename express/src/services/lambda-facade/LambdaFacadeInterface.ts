import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";

export type UserUpdates = Record<string, string | Date>;
export type ClientUpdates = Record<string, string | string[]>;
export type ServiceNameUpdates = {service_name: string};

export default interface LambdaFacadeInterface {
    putUser(user: OnboardingTableItem, accessToken: string): Promise<void>;

    updateUser(selfServiceUserId: string, updates: UserUpdates, accessToken: string): Promise<void>;

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse>;

    newService(service: Service, userId: string, email: string, accessToken: string): Promise<void>;

    generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse>;

    listServices(userId: string): Promise<AxiosResponse>;

    // TODO The QueryCommandOutput type should be replaced by a class shared between the frontend and the API (contract)
    listClients(serviceId: string): Promise<AxiosResponse<QueryCommandOutput>>;

    publicBetaRequest(name: string, department: string, serviceName: string, emailAddress: string): Promise<void>;

    updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ClientUpdates,
        accessToken: string
    ): Promise<void>;

    updateService(serviceId: string, updates: ServiceNameUpdates, accessToken: string): Promise<void>;

    sessionCount(userEmail: string): Promise<AxiosResponse>;

    globalSignOut(userEmail: string): Promise<AxiosResponse>;
}
