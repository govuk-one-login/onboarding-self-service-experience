export interface User {
    [id | pk]: string;
    [cognitoId | sk]: string;
    data: string;
    [firstName | first_name]: string | undefined;
    [lastName | last_name]: string | undefined;
    email: string | undefined;
    phone: string | undefined;
}
