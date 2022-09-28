export interface DynamoUser {
    pk: {S: string};
    sk: {S: string};
    data: {S: string};
    first_name: {S: string};
    last_name: {S: string};
    email: {S: string};
    phone: {S: string};
    password_last_updated: {S: string};
}

export interface User {
    id: string;
    fullName: string;
    firstName: string;
    lastName: string;
    email: string;
    mobileNumber: string;
    passwordLastUpdated: string;
}
