export interface ClientFromDynamo {
    pk: string;
    sk: string;
    clientId: string;
    contacts: string[];
    default_fields: string[];
    post_logout_redirect_uris: string[];
    public_key: string;
    redirect_uris: string[];
    scopes: string[];
    client_name: string;
    service_name: string;
    service_type: string;
    subject_type: string;
    type: string;
}

export interface Client {
    dynamoId: string;
    dynamoServiceId: string;
    authClientId: string;
    clientName: string;
    contacts: string[];
    defaultFields: string[];
    logoutUris: string[];
    publicKey: string;
    redirectUris: string[];
    scopes: string[];
    serviceName: string;
    serviceType: string;
    subjectType: string;
    type: string;
}
