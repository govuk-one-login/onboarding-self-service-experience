export default interface MfaResponse {
    cognitoSession: string;
    cognitoId: string;
    codeSentTo: string;
}
