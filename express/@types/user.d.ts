export interface User {
    pk: {S: string};
    sk: {S: string};
    data: {S: string};
    firstName?: {S: string} | undefined;
    first_name: {S: string} | undefined;
    lastName?: {S: string} | undefined;
    last_name: {S: string} | undefined;
    email: {S: string} | undefined;
    phone: {S: string} | undefined;
    password_last_updated: {S: string};
}

export interface User2 {
    cognitoId: string;
    mobileNumber: string;
}
