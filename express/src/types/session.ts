import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import {MfaResponse} from "../services/self-service-services-service";

declare module "express-session" {
    // noinspection JSUnusedGlobalSymbols
    interface SessionData {
        emailAddress: string;
        mobileNumber: string;
        cognitoSession: string;
        isSignedIn: boolean;
        authenticationResult: AuthenticationResultType;
        enteredMobileNumber: string;
        mfaResponse: MfaResponse;
        updatedField: string;
        serviceName: string;
    }
}
