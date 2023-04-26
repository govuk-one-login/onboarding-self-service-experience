import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import MfaResponse from "./mfa-response";

export default interface SelfServiceSessionData {
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
