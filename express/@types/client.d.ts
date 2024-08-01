export interface ClientFromDynamo {
    pk: string;
    sk: string;
    clientId: string;
    contacts: string[];
    default_fields: string[];
    post_logout_redirect_uris: string[];
    public_key_source: "STATIC" | "JWKS";
    public_key: string;
    jwks_uri: string;
    redirect_uris: string[];
    scopes: string[];
    client_name: string;
    service_name: string;
    service_type: string;
    subject_type: string;
    back_channel_logout_uri?: string | null;
    sector_identifier_uri: string;
    token_endpoint_auth_method: "private_key_jwt" | "client_secret_post";
    client_secret?: string;
    type: string;
    identity_verification_supported: boolean;
    claims?: string[];
    id_token_signing_algorithm?: "ES256" | "RS256";
    client_locs?: string[];
}

export interface Client {
    dynamoId: string;
    dynamoServiceId: string;
    authClientId: string;
    clientName: string;
    contacts: string[];
    defaultFields: string[];
    postLogoutUris: string[];
    publicKeySource: string;
    publicKey: string;
    jwksUri: string;
    redirectUris: string[];
    scopes: string[];
    back_channel_logout_uri?: string | null;
    sector_identifier_uri: string;
    serviceName: string;
    serviceType: string;
    subjectType: string;
    token_endpoint_auth_method: "private_key_jwt" | "client_secret_post";
    client_secret?: string;
    type: string;
    identity_verification_supported: boolean;
    claims?: string[];
    id_token_signing_algorithm?: "ES256" | "RS256";
    client_locs?: string[];
}
