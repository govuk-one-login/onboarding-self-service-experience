import LambdaFacadeInterface from "./LambdaFacadeInterface";

import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import {User} from "../../../@types/User";

import {AxiosResponse} from "axios";

class StubLambdaFacade implements LambdaFacadeInterface {
    constructor() {
        console.log("Creating stub lambda facade")

    }

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({data: {Items: [{pk: "none", sk: "of", data: "this matters"}]}} as AxiosResponse);
    }

    newService(service: Service, user: User, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }

    putUser(user: OnboardingTableItem, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }

    generateClient(serviceId: string, service: Service, contactEmail: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }

    listServices(userId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }

    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse> {
        return Promise.resolve({} as AxiosResponse);
    }
}
export const lambdaFacadeInstance = new StubLambdaFacade();