import Service from "@self-service/client/service";
import User from "@self-service/client/user";
import OnboardingTableItem from "@self-service/common/onboarding-table-item";
import {AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import {User} from "../../../@types/user";

export type Updates = {[attribute: string]: Date | string | string[]};

export default interface LambdaFacadeInterface {
    putUser(user: OnboardingTableItem, accessToken: string): Promise<AxiosResponse>;

    updateUser(selfServiceUserId: string, cognitoUserId: string, updates: Updates, accessToken: string): Promise<AxiosResponse>;

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse>;

    newService(service: Service, user: User, accessToken: string): Promise<AxiosResponse>;

    generateClient(serviceId: string, service: Service, contactEmail: string, accessToken: string): Promise<AxiosResponse>;

    listServices(userId: string, accessToken: string): Promise<AxiosResponse>;

    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse>;

    updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: Updates,
        accessToken: string
    ): Promise<AxiosResponse>;

    privateBetaRequest(
        name: string,
        department: string,
        serviceName: string,
        emailAddress: string,
        accessToken: string
    ): Promise<AxiosResponse>;
}
