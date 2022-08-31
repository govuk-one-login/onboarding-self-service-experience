import {
    AdminCreateUserCommandOutput,
    AdminGetUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommandOutput,
    AdminSetUserMFAPreferenceCommandOutput,
    AdminUpdateUserAttributesCommandOutput,
    ChangePasswordCommandOutput,
    GetUserAttributeVerificationCodeCommandOutput,
    RespondToAuthChallengeCommandOutput,
    UsernameExistsException,
    VerifyUserAttributeCommandOutput
} from "@aws-sdk/client-cognito-identity-provider";
import {ServiceException} from "@aws-sdk/smithy-client/dist-types/exceptions";
import {promises as fs} from "fs";
import CognitoInterface from "./CognitoInterface";

type Override = {
    parameter: string;
    value: string;
    return?: any;
    throw?: string;
};

export class CognitoClient implements CognitoInterface {
    overrides: Promise<any>;

    constructor() {
        console.log("Creating stub Cognito client...");
        this.overrides = fs.readFile("./stubs-config.json");
    }

    async createUser(email: string): Promise<AdminCreateUserCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("login", "email", email);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    async resendEmailAuthCode(email: string): Promise<AdminCreateUserCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("login", "email", email);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    getUser(username: string): Promise<AdminGetUserCommandOutput> {
        return Promise.resolve({$metadata: {}, Username: username});
    }

    async login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("login", "email", email);
        return Promise.resolve(returnValue || {$metadata: {}});
    }

    sendMobileNumberVerificationCode(accessToken: string): Promise<GetUserAttributeVerificationCodeCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    setEmailAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        return Promise.resolve({UserAttributes: [{Name: "email", Value: username}], $metadata: {}});
    }

    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput> {
        return Promise.resolve({AuthenticationResult: {AccessToken: "let me in!"}, $metadata: {}});
    }

    changePassword(accessToken: string, previousPassword: string, proposedPassword: string): Promise<ChangePasswordCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    setPhoneNumber(username: string, phoneNumber: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    verifySmsCode(accessToken: string, code: string): Promise<VerifyUserAttributeCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AdminRespondToAuthChallengeCommandOutput> {
        return Promise.resolve({
            AuthenticationResult: {
                AccessToken: "some value reuquired",
                IdToken:
                    "eyJraWQiOiJYWVpFRXVCT2FUSUNKeHNDOE9qRUJBeWxLd2tUTzl5MWhcL3J3MEpOVkJwRT0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJYWVpjZDQ5Yy03ODkzLTRmYTctOTJmNi00YTc0MzgwMTg4M2UiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LXdlc3QtMi5hbWF6b25hd3MuY29tXC9ldS13ZXN0LTJfWFlaIiwicGhvbmVfbnVtYmVyX3ZlcmlmaWVkIjp0cnVlLCJjb2duaXRvOnVzZXJuYW1lIjoiWFlaY2Q0OWMtQUJDMy00ZmE3LUxNTjYtT1A3NDM4MDE4ODNlIiwib3JpZ2luX2p0aSI6IlhZWjgxZDI5LTRkNmItSElKSy1hMDJkLWM0NzQxMTVhMmY0MyIsImF1ZCI6IlhZWnVqdmtya09PT3F1bGJxMjNzMXZoNWN0IiwiZXZlbnRfaWQiOiJYWVo3MTZmYi0wNjNlLTRBQmYtQ0QyYy00NzhmYjE4ZDY1WloiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY1NTQ2MjQyNCwicGhvbmVfbnVtYmVyIjoiKzQ0NzkwMDAwMDAwMCIsImV4cCI6MTY1NTQ2NjAyNCwiaWF0IjoxNjU1NDYyNDI0LCJqdGkiOiJYWVphOGYxYS1lMDk4LTQ3M2EtOWFlZS1iYTEzOTM5OGU4MzEiLCJlbWFpbCI6InJlZ2lzdGVyZWRAZ2RzLmdvdi51ayJ9.Li6+ccrRLsc9O9wKLi5RIKwuV0MuvTguvnYuLi7XpEsuLvmhLi5acS5tV1Z9zC6r00MtcHIxrKouXlHzay9bLv2kXS5O3PIubdbqLrxMLujDLjFJLli/LnRIp+N51uFIYMwueiqrU/ulalJqTbVUsqVY4twuNynTLE0uT1lVM7u8IS5OLtq8y2kuaUBRMO8uwi7BomBgODCwv2xDqS6nxS4uLi4iLmRzOC4uM0/g4+oKVqV4LsE7RqoxcS5eLi4uLrOotO1k+cMu9PC4J+kx/S4u8zUuLkMrLtXuLi602i4nNlt7LkzNLi7rXOgtwH2yOjHjzi4uLi7B"
            },
            $metadata: {}
        });
    }

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
        }

        throw new Error("Unknown exception");
    }
}

module.exports = {CognitoClient}
