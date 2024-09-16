import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import {TxMAEvent} from "../../types/txma-event";

export type UserUpdates = Record<string, string | Date>;
export type ClientUpdates = Record<string, string | string[] | boolean>;
export type ServiceNameUpdates = {service_name: string};

export default interface LambdaFacadeInterface {
    putUser(user: OnboardingTableItem, accessToken: string): Promise<void>;

    updateUser(selfServiceUserId: string, updates: UserUpdates, accessToken: string): Promise<void>;

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse>;

    newService(service: Service, userId: string, email: string, accessToken: string): Promise<void>;

    generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse>;

    listServices(userId: string, accessToken: string): Promise<AxiosResponse>;

    // TODO The QueryCommandOutput type should be replaced by a class shared between the frontend and the API (contract)
    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse<QueryCommandOutput>>;

    updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ClientUpdates,
        accessToken: string
    ): Promise<void>;

    updateService(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ServiceNameUpdates,
        accessToken: string
    ): Promise<void>;

    sessionCount(userEmail: string): Promise<AxiosResponse>;

    globalSignOut(userEmail: string): Promise<AxiosResponse>;

    sendTxMALog(message: TxMAEvent): Promise<void>;

    getDynamoDBEntries(email: string): Promise<AxiosResponse>;

    deleteClientEntries(oldUserID: string, serviceID: string): Promise<void>;
    deleteServiceEntries(serviceID: string): Promise<void>;
}
