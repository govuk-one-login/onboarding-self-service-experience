import {OnboardingTableItem} from "../../../@types/OnboardingTableItem";
import {DynamoUser, User} from "../../../@types/user";

export function userToDomainUser(user: DynamoUser): User {
    return {
        id: user.pk.S.substring("user#".length),
        fullName: user.data.S,
        firstName: user.first_name.S,
        lastName: user.last_name.S,
        email: user.email.S,
        mobileNumber: user.phone.S,
        passwordLastUpdated: user.password_last_updated.S
    };
}

export function domainUserToDynamoUser(user: User): OnboardingTableItem {
    return {
        data: user.fullName,
        email: user.email,
        first_name: user.firstName,
        last_name: user.lastName,
        password_last_updated: user.passwordLastUpdated,
        phone: user.mobileNumber,
        sk: `user#${user.id}`,
        pk: `user#${user.id}`
    };
}
