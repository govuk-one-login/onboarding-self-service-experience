import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";

// https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-verifying-a-jwt.html
// const HEADER_INDEX = 0;
const PAYLOAD_INDEX = 1;
// const SIGNATURE = 2;

export default class AuthenticationResultParser {
    static getRefreshToken(authenticationResult: AuthenticationResultType): string {
        return authenticationResult.RefreshToken as string;
    }

    static getCognitoId(authenticationResult: AuthenticationResultType): string {
        const claims = this.getIdClaims(authenticationResult);
        return claims["cognito:username"] || claims["sub"];
    }

    static getPhoneNumber(authenticationResult: AuthenticationResultType): string {
        return AuthenticationResultParser.getIdClaim("phone_number", authenticationResult);
    }

    static getEmail(authenticationResult: AuthenticationResultType): string {
        return AuthenticationResultParser.getIdClaim("email", authenticationResult);
    }

    private static getIdClaim(claim: string, authenticationResult: AuthenticationResultType): string {
        return this.getIdClaims(authenticationResult)[claim];
    }

    private static getIdClaims(authenticationResult: AuthenticationResultType): {[key: string]: string} {
        const payload = authenticationResult.IdToken?.split(".") as string[];
        return JSON.parse(Buffer.from(payload[PAYLOAD_INDEX], "base64").toString("utf-8"));
    }
}
