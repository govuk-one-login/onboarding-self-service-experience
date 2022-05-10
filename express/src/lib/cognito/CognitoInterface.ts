import {
    AdminCreateUserCommandOutput
} from "@aws-sdk/client-cognito-identity-provider/dist-types/commands/AdminCreateUserCommand";

export default interface CognitoInterface {
    createUser(email: string): Promise<AdminCreateUserCommandOutput>;
}