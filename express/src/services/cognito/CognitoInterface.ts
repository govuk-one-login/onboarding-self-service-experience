import {
    AdminGetUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommandOutput,
    RespondToAuthChallengeCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";

export default interface CognitoInterface {
    adminGetUserCommandOutput(userName: string): Promise<AdminGetUserCommandOutput>;

    changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<void>;

    confirmForgotPassword(username: string, password: string, confirmationCode: string): Promise<void>;

    createUser(email: string): Promise<void>;

    forgotPassword(email: string, protocol: string, host: string, useRecoveredAccountURL: boolean): Promise<void>;

    getUser(accessToken: string): Promise<AdminInitiateAuthCommandOutput>;

    globalSignOut(accessToken: string): Promise<AdminInitiateAuthCommandOutput>;

    login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput>;

    recoverUser(emailAddress: string): Promise<void>;

    resendEmailAuthCode(email: string): Promise<void>;

    respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AdminRespondToAuthChallengeCommandOutput>;

    sendMobileNumberVerificationCode(accessToken: string): Promise<void>;

    setEmailAsVerified(username: string): Promise<void>;

    setMfaPreference(cognitoUsername: string): Promise<void>;

    setMobilePhoneAsVerified(username: string): Promise<void>;

    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput>;

    setPhoneNumber(username: string, phoneNumber: string): Promise<void>;

    setSignUpStatus(username: string, status: string): Promise<void>;

    setUserPassword(userEmail: string, password: string): Promise<void>;

    useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput>;

    verifyMobileUsingSmsCode(accessToken: string, code: string, emailAddress: string): Promise<void>;
}
