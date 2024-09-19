import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import {api} from "../../config/environment";
import AuthenticationResultParser from "../../lib/authentication-result-parser";
import LambdaFacadeInterface, {ClientUpdates, ServiceNameUpdates, UserUpdates} from "./LambdaFacadeInterface";
import console from "console";
import axios, {Axios, AxiosResponse} from "axios";
import {TxMAEvent} from "../../types/txma-event";

/* eslint-disable @typescript-eslint/no-unused-vars */
export default class LambdaFacade implements LambdaFacadeInterface {
    private readonly client: Axios;

    constructor() {
        console.log("Creating Lambda facade...");

        this.client = axios.create({
            baseURL: api.baseUrl,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    async putUser(user: OnboardingTableItem, accessToken: string): Promise<void> {
        try {
            await this.post("/put-user", user, accessToken);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse> {
        return this.post("/get-user", `user#${cognitoId}`, accessToken);
    }

    async newService(service: Service, userId: string, email: string, accessToken: string): Promise<void> {
        const body = {
            service: service,
            userDynamoId: userId,
            userEmail: email
        };

        try {
            await this.post("/new-service", JSON.stringify(body), accessToken);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse> {
        const body = {
            service: service,
            contactEmail: AuthenticationResultParser.getEmail(authenticationResult)
        };

        return this.post("/new-client", JSON.stringify(body), authenticationResult.AccessToken);
    }

    async updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ClientUpdates,
        accessToken: string
    ): Promise<void> {
        // TODO constrain type later
        const body = {
            serviceId: serviceId,
            selfServiceClientId: selfServiceClientId,
            clientId: clientId,
            updates: updates
        };

        try {
            await this.post(`/update-client`, JSON.stringify(body), accessToken);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    async updateService(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: ServiceNameUpdates,
        accessToken: string
    ): Promise<void> {
        // TODO constrain type later
        const body = {
            serviceId: serviceId,
            selfServiceClientId: selfServiceClientId,
            clientId: clientId,
            updates: updates
        };

        try {
            await this.post(`/update-service`, JSON.stringify(body), accessToken);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    listServices(userId: string, accessToken: string): Promise<AxiosResponse> {
        return this.get(`/get-services/${userId}`, accessToken);
    }

    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse<QueryCommandOutput>> {
        const bareServiceId = serviceId.startsWith("service#") ? serviceId.substring(8) : serviceId;
        return this.get(`/get-service-clients/${bareServiceId}`, accessToken);
    }

    async updateUser(selfServiceUserId: string, updates: UserUpdates, accessToken: string): Promise<void> {
        const body = {
            userId: selfServiceUserId,
            updates: updates
        };

        try {
            await this.post("/update-user", JSON.stringify(body), accessToken);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    async sendTxMALog(message: TxMAEvent) {
        try {
            await this.post("/txma-logging", message);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    async getDynamoDBEntries(userEmail: string): Promise<AxiosResponse> {
        console.log("In LambdaFacade-getDynamoDBEntries");

        const endPoint: string = "/get-dynamodb-entries/" + userEmail;
        console.log("EndPoint => " + endPoint);

        try {
            return await this.get(endPoint);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    async deleteClientEntries(userID: string, serviceID: string, accessToken: string): Promise<void> {
        console.log("In LambdaFacade-deleteClientEntries");

        const body = {
            userId: userID,
            serviceId: serviceID
        };

        try {
            await this.post("/delete-dynamodb-client-entries/", JSON.stringify(body), accessToken);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    async deleteServiceEntries(serviceID: string, accessToken: string): Promise<void> {
        console.log("In LambdaFacade-deleteServiceEntries");

        const body = {
            serviceId: serviceID
        };

        try {
            await this.post("/delete-dynamodb-service-entries/", JSON.stringify(body), accessToken);
        } catch (error) {
            console.error(error as Error);
            throw error;
        }
    }

    globalSignOut(userEmail: string): Promise<AxiosResponse> {
        return this.get(`/global-sign-out/${userEmail}`);
    }

    private get(endpoint: string, accessToken = ""): Promise<AxiosResponse> {
        if (accessToken === "") {
            return this.client.get(endpoint);
        }

        return this.client.get(endpoint, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    private post(endpoint: string, data: object | string, accessToken = ""): Promise<AxiosResponse> {
        if (accessToken === "") {
            return this.client.post(endpoint, data);
        }

        return this.client.post(endpoint, data, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });
    }

    sessionCount(userEmail: string): Promise<AxiosResponse> {
        return this.get(`/get-session-count/${userEmail}`);
    }
}
