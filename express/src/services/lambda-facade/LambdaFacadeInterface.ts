import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";

export default interface LambdaFacadeInterface {
    putUser(user: OnboardingTableItem, accessToken: string): Promise<AxiosResponse>;

    updateUser(selfServiceUserId: string, updates: object, accessToken: string): Promise<AxiosResponse>;

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse>;

    newService(service: Service, userId: string, email: string, accessToken: string): Promise<AxiosResponse>;

    generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse>;

    listServices(userId: string, accessToken: string): Promise<AxiosResponse>;

    // TODO The QueryCommandOutput type should be replaced by a class shared between the frontend and the API (contract)
    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse<QueryCommandOutput>>;

    updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: object,
        accessToken: string
    ): Promise<AxiosResponse<QueryCommandOutput>>;

    privateBetaRequest(
        name: string,
        department: string,
        serviceName: string,
        emailAddress: string,
        accessToken: string
    ): Promise<AxiosResponse>;
}
