import {
    AdminCreateUserCommandOutput,
    SignUpCommandOutput,
    AdminInitiateAuthCommandOutput,
    ConfirmSignUpCommandOutput,
    RespondToAuthChallengeCommandOutput,
    AdminGetUserCommandOutput,
    AdminUpdateUserAttributesCommandOutput,
    GetUserAttributeVerificationCodeCommandOutput,
    VerifyUserAttributeCommandOutput

} from "@aws-sdk/client-cognito-identity-provider";

export default interface CognitoInterface {
    createUser(email: string): Promise<AdminCreateUserCommandOutput>;
    login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput>;
    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput>;
    getUser(username: string): Promise<AdminGetUserCommandOutput>;
    setEmailAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput>;
    setPhoneNumber(username: string, phoneNumber: string): Promise<AdminUpdateUserAttributesCommandOutput>;
    sendMobileNumberVerificationCode(accessToken: string): Promise<GetUserAttributeVerificationCodeCommandOutput>;
    verifySmsCode(accessToken: string, code: string): Promise<VerifyUserAttributeCommandOutput>;
}