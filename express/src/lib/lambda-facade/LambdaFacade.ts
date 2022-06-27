import axios, {Axios, AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {User} from "../../../@types/User";
import {Service} from "../../../@types/Service";
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
        return await (await this.instance).post('/Prod/put-user', user, {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse> {
        return await (await this.instance).post('/Prod/get-user', cognitoId, {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async newService(service: Service, user: User, accessToken: string): Promise<AxiosResponse> {
        let body = {
            service: service,
            user: user
        }
        console.log("SENDING TO STEP FUNCTION ".repeat(10))
        console.log(JSON.stringify(body))
        return await (await this.instance).post('/Prod/new-service', JSON.stringify(body), {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async generateClient(serviceId: string, service: Service, contactEmail: string, accessToken: string): Promise<AxiosResponse> {
        let body = {
            serviceId: serviceId,
            service: service,
            contactEmail: contactEmail
        }
        return await (await this.instance).post('/Prod/new-client', JSON.stringify(body), {
            headers: {
                "authorised-by": accessToken
            }
        });
    }

    async listServices(userId: string, accessToken: string): Promise<AxiosResponse> {
        const bareUserId = userId.substring(5);
        return await (await this.instance).get(`/Prod/get-services/${bareUserId}`);
    }

    async listClients(serviceId: string, accessToken: string): Promise<AxiosResponse> {
        console.log("ServiceId is: " + serviceId)
        const bareServiceId = serviceId.startsWith("service#") ? serviceId.substring(8) : serviceId;
        return await (await this.instance).get(`/Prod/get-service-clients/${bareServiceId}`);
    }
}
export const lambdaFacadeInstance = new LambdaFacade(process.env.API_BASE_URL as string);