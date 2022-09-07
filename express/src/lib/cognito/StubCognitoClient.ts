import {
    AdminCreateUserCommandOutput,
    AdminGetUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminRespondToAuthChallengeCommandOutput,
    AdminSetUserMFAPreferenceCommandOutput,
    AdminUpdateUserAttributesCommandOutput,
    ChangePasswordCommandOutput,
    CodeMismatchException,
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
        return Promise.resolve({$metadata: {}, Username: username, UserAttributes: [{Name: "email", Value: "email@mail.com"}]});
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

    async verifySmsCode(accessToken: string, code: string): Promise<VerifyUserAttributeCommandOutput> {
        const returnValue = await this.getOverriddenReturnValue("verifySmsCode", "code", code);
        return Promise.resolve(returnValue || {$metadata: {}});
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
            case "CodeMismatchException":
                return new CodeMismatchException({$metadata: {}});
        }
        throw new Error("Unknown exception");
    }

    respondToMfaChallenge(username: string, mfaCode: string, session: string): Promise<AdminRespondToAuthChallengeCommandOutput> {
        return Promise.resolve(this.getOverriddenReturnValue("respondToMfaChallenge", "username", username) || {$metadata: {}});
    }

    setMobilePhoneAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }
}

module.exports = {CognitoClient};
