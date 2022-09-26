import {User, DynamoUser} from "../../@types/user";

export function userToDomainUser(user: DynamoUser): User {
    return {
        dynamoId: user.pk.S.substring("user#".length),
        cognitoId: user.sk.S.substring("cognito_username#".length),
        fullName: user.data.S,
        firstName: user.first_name.S,
        lastName: user.last_name.S,
        email: user.email.S,
        mobileNumber: user.phone.S,
        passwordLastUpdated: user.password_last_updated.S
    };
}
