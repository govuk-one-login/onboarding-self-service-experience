import axios, {Axios, AxiosResponse} from "axios";
import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {User} from "../../../@types/User";

class LambdaFacade {
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
}

export const lambdaFacadeInstance = new LambdaFacade(process.env.API_BASE_URL as string);