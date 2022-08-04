export interface User {
    pk: {S: string};
    sk: {S: string};
    data: {S: string};
    [firstName | first_name]: {S: string} | undefined;
    [lastName | last_name]: {S: string} | undefined;
    email: {S: string} | undefined;
    phone: {S: string} | undefined;
    password_last_updated: {S: string};
}