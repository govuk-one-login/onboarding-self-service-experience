import {
    AdminCreateUserCommandOutput,
    AdminGetUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminUpdateUserAttributesCommandOutput,
    GetUserAttributeVerificationCodeCommandOutput,
    RespondToAuthChallengeCommandOutput,
    VerifyUserAttributeCommandOutput,
    ChangePasswordCommandOutput,
    AdminSetUserMFAPreferenceCommandOutput,
    AdminRespondToAuthChallengeCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

export default interface CognitoInterface {
    createUser(email: string): Promise<AdminCreateUserCommandOutput>;

    resendEmailAuthCode(email: string): Promise<AdminCreateUserCommandOutput>;

    login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput>;

    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput>;

    changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<ChangePasswordCommandOutput>;

    getUser(username: string): Promise<AdminGetUserCommandOutput>;

    setEmailAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput>;

    setPhoneNumber(username: string, phoneNumber: string): Promise<AdminUpdateUserAttributesCommandOutput>;

    sendMobileNumberVerificationCode(accessToken: string): Promise<GetUserAttributeVerificationCodeCommandOutput>;

    verifySmsCode(accessToken: string, code: string): Promise<VerifyUserAttributeCommandOutput>;

    setMfaPreference(cognitoUsername: string): Promise<AdminSetUserMFAPreferenceCommandOutput>;

    respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AdminRespondToAuthChallengeCommandOutput>;
}
