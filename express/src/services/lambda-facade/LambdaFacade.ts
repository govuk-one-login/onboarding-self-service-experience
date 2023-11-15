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
        await this.post("/put-user", user, accessToken);
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

        await this.post("/new-service", JSON.stringify(body), accessToken);
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

        await this.post(`/update-client`, JSON.stringify(body), accessToken);
    }

    async updateService(serviceId: string, updates: ServiceNameUpdates, accessToken: string): Promise<void> {
        // TODO constrain type later
        const body = {
            serviceId: serviceId,
            updates: updates
        };

        await this.post(`/update-service`, JSON.stringify(body), accessToken);
    }

    listServices(userId: string): Promise<AxiosResponse> {
        return this.get(`/get-services/${userId}`);
    }

    // TODO Don't we need to use the token to authorise when making the call to the database? Seems odd it's not used
    listClients(serviceId: string): Promise<AxiosResponse<QueryCommandOutput>> {
        const bareServiceId = serviceId.startsWith("service#") ? serviceId.substring(8) : serviceId;
        return this.get(`/get-service-clients/${bareServiceId}`);
    }

    async updateUser(selfServiceUserId: string, updates: UserUpdates, accessToken: string): Promise<void> {
        const body = {
            userId: selfServiceUserId,
            updates: updates
        };

        await this.post("/update-user", JSON.stringify(body), accessToken);
    }

    async publicBetaRequest(name: string, department: string, serviceName: string, emailAddress: string): Promise<void> {
        const body = {
            name: name,
            department: department,
            serviceName: serviceName,
            emailAddress: emailAddress
        };

        await this.post("/send-public-beta-request-notification", JSON.stringify(body));
    }

    async sendTxMALog(message: TxMAEvent) {
        await this.post("/txma-logging", message);
    }

    async getDynamoDBEntries(userEmail: string): Promise<AxiosResponse> {
        console.log("In LambdaFacade-getDynamoDBEntries");

        const endPoint: string = "/get-dynamodb-entries/" + userEmail;
        console.log("EndPoint => " + endPoint);

        return await this.get(endPoint);
    }

    async deleteClientEntries(userID: string, serviceID: string): Promise<void> {
        console.log("In LambdaFacade-deleteClientEntries");

        const body = {
            userId: userID,
            serviceId: serviceID
        };

        await this.post("/delete-dynamodb-client-entries/", JSON.stringify(body));
    }

    globalSignOut(userEmail: string): Promise<AxiosResponse> {
        return this.get(`/global-sign-out/${userEmail}`);
    }

    private get(endpoint: string): Promise<AxiosResponse> {
        return this.client.get(endpoint);
    }

    private post(endpoint: string, data: object | string, accessToken = ""): Promise<AxiosResponse> {
        return this.client.post(endpoint, data, {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    sessionCount(userEmail: string): Promise<AxiosResponse> {
        return this.get(`/get-session-count/${userEmail}`);
    }
}
