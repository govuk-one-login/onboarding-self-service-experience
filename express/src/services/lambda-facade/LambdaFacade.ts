import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import axios, {Axios, AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import AuthenticationResultParser from "../../lib/AuthenticationResultParser";
import LambdaFacadeInterface from "./LambdaFacadeInterface";

class LambdaFacade implements LambdaFacadeInterface {
    private instance: Axios;

    constructor(baseURL: string) {
        this.instance = axios.create({
            baseURL: baseURL,
            headers: {
                "Content-Type": "application/json"
            }
        });
    }

    async putUser(user: OnboardingTableItem, accessToken: string): Promise<AxiosResponse> {
        return await (
            await this.instance
        ).post("/put-user", user, {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse> {
        return await (
            await this.instance
        ).post("/get-user", `user#${cognitoId}`, {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async newService(service: Service, userId: string, email: string, accessToken: string): Promise<AxiosResponse> {
        const body = {
            service: service,
            userDynamoId: userId,
            userEmail: email
        };
        return await (
            await this.instance
        ).post("/new-service", JSON.stringify(body), {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async generateClient(service: Service, authenticationResult: AuthenticationResultType): Promise<AxiosResponse> {
        const body = {
            service: service,
            contactEmail: AuthenticationResultParser.getEmail(authenticationResult)
        };
        return await (
            await this.instance
        ).post("/new-client", JSON.stringify(body), {
            headers: {
                "authorised-by": authenticationResult.AccessToken as string
            }
        });
    }

    async updateClient(
        serviceId: string,
        selfServiceClientId: string,
        clientId: string,
        updates: object,
        accessToken: string
    ): Promise<AxiosResponse<QueryCommandOutput>> {
        // TODO constrain type later
        const body = {
            serviceId: serviceId,
            selfServiceClientId: selfServiceClientId,
            clientId: clientId,
            updates: updates
        };

        return this.instance.post(`/update-client`, JSON.stringify(body), {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async listServices(userId: string, accessToken: string): Promise<AxiosResponse> {
        return await (await this.instance).get(`/get-services/${userId}`);
    }

    // TODO Don't we need to use the token to authorise when making the call to the database? Seems odd it's not used
    listClients(serviceId: string, accessToken: string): Promise<AxiosResponse<QueryCommandOutput>> {
        const bareServiceId = serviceId.startsWith("service#") ? serviceId.substring(8) : serviceId;
        return this.instance.get(`/get-service-clients/${bareServiceId}`);
    }

    async updateUser(selfServiceUserId: string, updates: Record<string, string | Date>, accessToken: string): Promise<AxiosResponse> {
        const body = {
            userId: selfServiceUserId,
            updates: updates
        };

        return await (
            await this.instance
        ).post("/update-user", JSON.stringify(body), {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async privateBetaRequest(
        name: string,
        department: string,
        serviceName: string,
        emailAddress: string,
        accessToken: string
    ): Promise<AxiosResponse> {
        const body = {
            name: name,
            department: department,
            serviceName: serviceName,
            emailAddress: emailAddress
        };

        return await (await this.instance).post("/send-private-beta-request-notification", JSON.stringify(body));
    }
}

export const lambdaFacadeInstance = new LambdaFacade(process.env.API_BASE_URL as string);
