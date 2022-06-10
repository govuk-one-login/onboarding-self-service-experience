import CognitoInterface from "./CognitoInterface";

import {
    AdminGetUserCommandOutput,
    AdminCreateUserCommandOutput,
    AdminInitiateAuthCommandOutput,
    AdminUpdateUserAttributesCommandOutput,
    GetUserAttributeVerificationCodeCommandOutput,
    RespondToAuthChallengeCommandOutput,
    VerifyUserAttributeCommandOutput, UsernameExistsException
} from "@aws-sdk/client-cognito-identity-provider";

import { ServiceException } from '@aws-sdk/smithy-client/dist-types/exceptions'
import {promises as fs} from "fs";
import {Override, Overrides} from "../../../@types/StubCognitoClient";

export class CognitoClient implements CognitoInterface {
    overrides: Promise<any>;

    constructor() {
        this.overrides = fs.readFile("./stubs-config.json");
    }

    async createUser(email: string): Promise<AdminCreateUserCommandOutput> {
        let overrides: any = await this.getOverridesFor('createUser');

        if (overrides === undefined) {
            return Promise.resolve({$metadata: {}});
        }

        let override: any = overrides.filter(
            (override: { value: string }) => (override.value === email))[0];

        if (override === undefined) {
            return Promise.resolve({$metadata: {}});
        }

        if (override?.throw) {
            throw this.getException(override.throw);
        } else {
            return Promise.resolve(override.return); // something from the config file
        }
    }

    getUser(username: string): Promise<AdminGetUserCommandOutput> {
        return Promise.resolve({$metadata: {}, Username: username});
    }

    async login(email: string, password: string): Promise<AdminInitiateAuthCommandOutput> {
        let overrides: any = await this.getOverridesFor('login');

        if (overrides === undefined) {
            return Promise.resolve({$metadata: {}});
        }

        let override: any = overrides.filter(
            (override: { value: string }) => (override.value === email))[0];


        if (override === undefined) {
            return Promise.resolve({$metadata: {}});
        }

        if (override?.throw) {
            throw this.getException(override.throw);
        } else {
            return Promise.resolve(override.return); // something from the config file
        }
    }

    sendMobileNumberVerificationCode(accessToken: string): Promise<GetUserAttributeVerificationCodeCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    setEmailAsVerified(username: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        return Promise.resolve({UserAttributes: [{Name: 'email', Value: username}], $metadata: {}});
    }

    setNewPassword(email: string, password: string, session: string): Promise<RespondToAuthChallengeCommandOutput> {
        return Promise.resolve({AuthenticationResult: {AccessToken: "let me in!"}, $metadata: {}});
    }

    setPhoneNumber(username: string, phoneNumber: string): Promise<AdminUpdateUserAttributesCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    verifySmsCode(accessToken: string, code: string): Promise<VerifyUserAttributeCommandOutput> {
        return Promise.resolve({$metadata: {}});
    }

    private async getOverridesFor(method: string): Promise<any | undefined> {
        let overrides: any = (await this.overrides);
        if (overrides === undefined) {
            return undefined;
        }
        return JSON.parse(overrides)[method];
    }

    private getException(exception: string): ServiceException  {
        switch (exception) {
            case 'UsernameExistsException' :
                return new UsernameExistsException({$metadata: {}});
        }
        throw new Error('Unknown exception');
    }

}

module.exports = {CognitoClient}
