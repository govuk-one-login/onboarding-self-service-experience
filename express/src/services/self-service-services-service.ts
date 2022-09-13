import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {User} from "../../@types/user";
import SelfServiceError from "../lib/self-service-error";
import CognitoInterface from "./cognito/CognitoClient.interface";
import LambdaFacadeInterface from "./lambda/LambdaFacadeInterface";

// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
// const HEADER_INDEX = 0;
const PAYLOAD_INDEX = 1;
// const SIGNATURE = 2;

export default class SelfServiceServicesService {
    private cognito: CognitoInterface;
    private lambda: LambdaFacadeInterface;

    constructor(cognito: CognitoInterface, lambda: LambdaFacadeInterface) {
        this.cognito = cognito;
        this.lambda = lambda;
    }

    async respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AuthenticationResultType> {
        const response = await this.cognito.respondToMfaChallenge(username, mfaCode, session);

        if (!response.AuthenticationResult) {
            throw new SelfServiceError("Did not get AuthenticationResult from Cognito");
        }

        return response.AuthenticationResult;
    }

    async getSelfServiceUser(authenticationResult: AuthenticationResultType): Promise<User> {
        console.log("GETTING SELF SERVICE USER");
        if (!authenticationResult.IdToken) {
            throw new SelfServiceError("IdToken not present");
        }

        if (!authenticationResult.AccessToken) {
            throw new SelfServiceError("AccessToken not present");
        }

        const payload = authenticationResult.IdToken.split("."); // TODO duplicated code
        const claims = Buffer.from(payload[PAYLOAD_INDEX], "base64").toString("utf-8");
        const cognitoId = JSON.parse(claims)["cognito:username"];

        const response = await this.lambda.getUserByCognitoId(cognitoId, authenticationResult.AccessToken);
        console.log(response.data);
        return response.data.Items[0];
    }
}
