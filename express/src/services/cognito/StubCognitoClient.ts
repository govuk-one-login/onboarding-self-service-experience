import {
    AdminCreateUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminSetUserMFAPreferenceCommandOutput,
    AdminUpdateUserAttributesCommandOutput,
    ChangePasswordCommandOutput,
    CodeMismatchException,
    GetUserAttributeVerificationCodeCommandOutput,
    NotAuthorizedException,
    RespondToAuthChallengeCommandOutput,
    UsernameExistsException,
    UserNotFoundException,
    VerifyUserAttributeCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";
import {ServiceException} from "@aws-sdk/smithy-client/dist-types/exceptions";
import {promises as fs} from "fs";
import path from "path";
import CognitoInterface from "./CognitoInterface";
import {prepareForCognito} from "../../lib/mobileNumberUtils";
import * as crypto from "crypto";

type Override = {
    parameter: string;
    value: string;
    return?: never;
    throw?: string;
};

export class CognitoClient implements CognitoInterface {
    kid = {kid: "bIXchwnF2Iyc/lFMKTHBvG+R6x1ea9ZN3sEegxjnL/k=", alg: "RS256"};

    accessTokenPayload = {
        sub: "11abcd56-a1e6-11f3-918c-40a8d79e9480",
        device_key: "eu-west-2_2f622f4f-a3d7-4a7f-bee9-558fc2ce34c1",
        iss: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_QdCNCN9jn",
        client_id: "447m7e0o3bomrnskmi5sp95v6g",
        origin_jti: "745d4ab4-11b5-4910-ab2d-03fac9fe22fd",
        event_id: "e612d1de-840f-4bca-af32-5a49d0d2f2e8",
        token_use: "access",
        scope: "aws.cognito.signin.user.admin",
        auth_time: 1663256712,
        exp: 1663260312,
        iat: 1663256712,
        jti: "bb59c20c-d73e-4f04-bdd5-5d852f163e3a",
        username: "11abcd56-a1e6-11f3-918c-40a8d79e9480"
    };

    idTokenPayload = {
        sub: "11abcd56-a1e6-11f3-918c-40a8d79e9480",
        iss: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_QdCNCN9jn",
        "cognito:username": "11abcd56-a1e6-11f3-918c-40a8d79e9480",
        origin_jti: "745d4ab4-11b5-4910-ab2d-03fac9fe22fd",
        aud: "447m7e0o3bomrnskmi5sp95v6g",
        event_id: "e612d1de-840f-4bca-af32-5a49d0d2f2e8",
        token_use: "id",
        auth_time: 1663256712,
        exp: 1663260312,
        iat: 1663256712,
        jti: "4eacc4a3-ca35-42b0-9d11-71730e38ea40",
        email: "testing@gds.gov.uk"
    };

    loggedInIdTokenPayload = {
        sub: "11abcd56-a1e6-11f3-918c-40a8d79e9480",
        email_verified: true,
        iss: "https://cognito-idp.eu-west-2.amazonaws.com/eu-west-2_QdCNCN9jn",
        phone_number_verified: true,
        "cognito:username": "11abcd56-a1e6-11f3-918c-40a8d79e9480",
        origin_jti: "9f1f1c2f-3461-4208-92e4-ec23cf3b4ac0",
        aud: "447m7e0o3bomrnskmi5sp95v6g",
        event_id: "33a92542-10b1-488f-aaf9-aa2de7fbc63e",
        token_use: "id",
        auth_time: 1663314206,
        phone_number: "+447958170405",
        exp: 1663317806,
        iat: 1663314206,
        jti: "ebc1a631-daac-4005-8bff-acf736b1e309",
        email: "testing@gds.gov.uk"
    };

    authenticationResult = {
        AccessToken: "replace using getIdToken()",
        ExpiresIn: 3600,
        IdToken: "replace using getAccessToken()",
        NewDeviceMetadata: {
            DeviceGroupKey: "-M2nI29X6",
            DeviceKey: "eu-west-2_bb745d49-5a3a-46d4-b71e-af50d89d4108"
        },
        RefreshToken:
            "eyJjdHkiOiJKV1QiLCJlbmMiOiJBMjU2R0NNIiwiYWxnIjoiUlNBLU9BRVAifQ.kVb6S9vSwaYEU7QHrN1mkCDCMOWCep_NRy9M6P40DRr5RHVqb7493CyMLNS1-pd1zLErT5rSrSG7_pbao-jxQwRrs8oWut1Jm1tRH3gfGbQ6zHrFQLwKTdK9baQCa2R-KZ7MD_1AIKN_OASNv9nyLF1zbUY6qBzXWcucXAfvOr73NGVVhuSKk8C0jaOTANDA0xk755pSzTeQ571UFfpvHaHeH0DWjSKxbXYm3EjfBbb4xWMb2w_ZvGoyO41SnCV15z-Wd_c-kAWXGFi7AekVqPQ2vdY8LpdgZCTfBe9sVXZB8Q4SiOhaFQU6DUx6HEn8Q5z3QcdO3PtrkOxJ6qfG2A.UWgNu3fNWWd1_uxg.s1XwWW4FFcuAZ7ek__bqoEUWNcA9YalSg0cVzW537kNr7-1gtVocVLIAXV80-R7uGmG4T0yM3YBmOkH_D1ctaONsVUNkgXawSZNf3KXoAsOlEBPQPkjuV8cZ9BQo6RkpNjt7GZQ2BGc9nTSOmPuSOBJMEA8MiDieo-c1fFbTGMnMy7vB3mt1QNGEzOvvwfRJEhcPAaxhu4akOpcf-x8Z8Gl7nCiJl8uunRhMCzmEwKUuNLhszlQJ7wYMvnzz3IjaharZKR9TAJ7kyn32nKkUj8RokRVsJ3rRG6LjIUSrWmafNP8VpQIshShV6n-Id9ItTp9F68aX4zv1xP_tbNekLJ9Oj4ZwB2LXMxHuA_enyq43ylKohGj7vp01OuExI3hAxg0cG45GHNb4_sTZXzMfOXQ5ycsXqsMrotw25r7Qlax8Ap0S1kZ44wqVzkHqSHbO6h72BFY4sycYDd4Q_SXDB_i8r4Oo_eOXEPdS2X1tMElsoGT4fvdenIxc-YG0jB7KEGvnUWOj7V2RNZVl5fVYtEoR19kPOwlkH5fJsqIb_5d6uL7-6AWZl8cF9jDDm_CwYv5-BMxpjnlTkNwB5uUcowDu8x1eBstEWyjn2pbdQQu_DD_uXvHDZBjm8ky74g24bGMB_YgAoaADDjCal317Tu2TCQGoloY2qGZjX6xydiJT13LlX97VDEw0lKqWvHAVZjjIwCT04kvT9uu5nvFGcBYA3y-Wzgs8h8Zc4mQXBiitAC2Vec3k2tI5rmNiuSUDTheC31T_KIjMBudEbEN0m7TBcrLvUFF7VP3ToenCuw72wRbeW7Ypulf-b30GOg9ODbQicqny7NCjgpw3cZtQyQKeRVxhQbto6XML2enfUGvFOVkYTddQLR6MfHftki5T9DyiL4Z2nM_7_dhWRYj2vOWXRYpXyVcm2foatZmlEOEWvggvdYfXXY3jmPElyAERcrqw0tUIwqjtGUuPrjP3uZQ7wzCpYyYTeluysQZEoG1pSQhrEATpEVUyep8G0Dgfuf-H8qdR9viVZx3V0kfZrEcJvZJoy3F6b40Jr_njRBekyXyB8GsZvYdWgdxdFP5fm8T_xS2bSXpiGMml6QFdx7POzXdxvTetbC6blAf1wmwPeb-YeVqcX4-XsBQ0EmNMPt9ip2oNfMZ9UpoT0H2ILXBVKE_IHNGJ5iGEnjjLxVD7NpuoavZsRd_Kpjmz5jXUJQzAOL1E1FPkQcjKQY8bm1YeZNUWgeNxW8x9H4p9zH0w0kWEDl2KubSYXeGhN2JjGxx3ZFtJbL3S7JJQviSKYIawTfxKFDrHE5Bs85N3grwmRzuGd6yUfA9NsH2CmU_gj0uTnJ22WvVQ5tyVDWBRkAmW1R6Ts498MeHUojxmaRBA7Hlh4J2SKM6p1vrH-gWk6UhbI6Gc8dxolAW0mMLvyGRch_AP9fwXekjxOOxb.1vTUzN815BSOGPdA9hsQCw",
        TokenType: "Bearer"
    };

    overrides: Promise<string>;

    constructor() {
        console.log("Creating stub Cognito client...");
        this.overrides = fs.readFile(path.join(__dirname, "../../../stub/stubs-config.json")).then(buffer => buffer.toString());
        this.authenticationResult.IdToken = this.getIdToken();
        this.authenticationResult.AccessToken = this.getAccessToken();
    }

    base64EncodeToken(token: object): string {
        return Buffer.from(JSON.stringify(token), "utf-8").toString("base64");
    }

    fakeSignature(): string {
        return Buffer.from(crypto.randomBytes(32)).toString("base64");
    }

    getIdToken(): string {
        return `${this.base64EncodeToken(this.kid)}.${this.base64EncodeToken(this.idTokenPayload)}.${this.fakeSignature()}`;
    }

    getLoggedInIdToken(): string {
        return `${this.base64EncodeToken(this.kid)}.${this.base64EncodeToken(this.loggedInIdTokenPayload)}.${this.fakeSignature()}`;
    }

    getAccessToken(): string {
        return `${this.base64EncodeToken(this.kid)}.${this.base64EncodeToken(this.accessTokenPayload)}.${this.fakeSignature()}`;
    }

    async createUser(email: string): Promise<AdminCreateUserCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("createUser", "email", email);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    async resendEmailAuthCode(email: string): Promise<AdminCreateUserCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("login", "email", email);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("login", "email", email);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    sendMobileNumberVerificationCode(accessToken: string): Promise<GetUserAttributeVerificationCodeCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    setEmailAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        return Promise.resolve({UserAttributes: [{Name: "email", Value: username}], $metadata: {}});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("setNewPassword", "password", password);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<ChangePasswordCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    setPhoneNumber(username: string, phoneNumber: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        this.loggedInIdTokenPayload.phone_number = prepareForCognito(phoneNumber);
        return Promise.resolve({$metadata: {}});
    }

    async verifyMobileUsingSmsCode(accessToken: string, code: string): Promise<VerifyUserAttributeCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("verifySmsCode", "code", code);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setMfaPreference(cognitoUsername: string): Promise<AdminSetUserMFAPreferenceCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    private async getOverriddenReturnValue(method: string, parameter: string, value: string) {
        const override = await this.getOverrideFor(method, parameter, value);
        if (override === undefined) {
            return undefined;
        }

        if (override?.throw) {
            throw this.getException(override.throw);
        } else {
            return override.return; // something from the config file
        }
    }

    private async getOverrideFor(method: string, parameter: string, value: string): Promise<Override | undefined> {
        const overrides = await this.overrides;
        if (overrides === undefined) {
            return undefined;
        }

        const methodOverrides: Override[] = JSON.parse(overrides)[method];
        if (methodOverrides === undefined) {
            return undefined;
        }

        return methodOverrides.filter(override => override.parameter === parameter).filter(override => override.value === value)[0];
    }

    private getException(exception: string): ServiceException {
        switch (exception) {
            case "UsernameExistsException":
                return new UsernameExistsException({$metadata: {}});
            case "CodeMismatchException":
                return new CodeMismatchException({$metadata: {}});
            case "NotAuthorizedException":
                return new NotAuthorizedException({$metadata: {}});
            case "UserNotFoundException":
                return new UserNotFoundException({$metadata: {}});
        }
        throw new Error("Unknown exception");
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars,@typescript-eslint/ban-types,@typescript-eslint/ban-ts-comment
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/ban-types,@typescript-eslint/no-unused-vars
    respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<undefined | {$metadata: {}}> {
        return Promise.resolve(this.getOverriddenReturnValue("respondToMfaChallenge", "username", username) || {$metadata: {}});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    setMobilePhoneAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    useRefreshToken(refreshToken: string): Promise<AdminInitiateAuthCommandOutput> {
        return Promise.resolve({AuthenticationResult: this.authenticationResult, $metadata: {}});
    }
}

module.exports = {CognitoClient};
