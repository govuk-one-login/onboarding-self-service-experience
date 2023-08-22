import {
    AdminGetUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommandOutput,
    RespondToAuthChallengeCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

export default interface CognitoInterface {
    createUser(email: string): Promise<void>;

    resendEmailAuthCode(email: string): Promise<void>;

    login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput>;

    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput>;

    changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<void>;

    forgotPassword(email: string, uri: string): Promise<void>;

    confirmForgotPassword(username: string, password: string, confirmationCode: string): Promise<void>;

    setEmailAsVerified(username: string): Promise<void>;

    setMobilePhoneAsVerified(username: string): Promise<void>;

    setPhoneNumber(username: string, phoneNumber: string): Promise<void>;

    sendMobileNumberVerificationCode(accessToken: string): Promise<void>;

    verifyMobileUsingSmsCode(accessToken: string, code: string): Promise<void>;

    setMfaPreference(cognitoUsername: string): Promise<void>;

    respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AdminRespondToAuthChallengeCommandOutput>;

    useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput>;

    getSignUpStatus(userName: string): Promise<AdminGetUserCommandOutput>;

    setSignUpStatus(username: string, status: string): Promise<void>;
}
