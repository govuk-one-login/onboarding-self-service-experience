import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {Service} from "../../../@types/Service";
import {User} from "../../../@types/User";

import {AxiosResponse} from "axios";

export default interface LambdaFacadeInterface {
    putUser(user: OnboardingTableItem, accessToken: string): Promise<AxiosResponse>;
    getUserByCognitoId(cognitoId: string, accessToken: string): Promise<AxiosResponse>;
    newService(service: Service, user: User, accessToken: string): Promise<AxiosResponse>;
}