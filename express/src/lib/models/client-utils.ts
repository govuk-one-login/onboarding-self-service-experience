import {Client, ClientFromDynamo} from "../../../@types/client";

export function dynamoClientToDomainClient(client: ClientFromDynamo): Client {
    return {
        dynamoId: client.pk.substring("service#".length),
        dynamoServiceId: client.sk.substring("client#".length),
        authClientId: client.clientId,
        clientName: client.client_name,
        contacts: client.contacts,
        defaultFields: client.default_fields,
        postLogoutUris: client.post_logout_redirect_uris ?? [],
        publicKeySource: client.public_key_source,
        publicKey: client.public_key,
        jwksUri: client.jwks_uri,
        redirectUris: client.redirect_uris,
        scopes: client.scopes,
        serviceName: client.service_name,
        serviceType: client.service_type,
        subjectType: client.subject_type,
        type: client.type,
        sector_identifier_uri: client.sector_identifier_uri,
        token_endpoint_auth_method: client.token_endpoint_auth_method,
        client_secret: client.client_secret,
        back_channel_logout_uri: client.back_channel_logout_uri,
        identity_verification_supported: client.identity_verification_supported,
        claims: client.claims,
        id_token_signing_algorithm: client.id_token_signing_algorithm,
        max_age_enabled: client.max_age_enabled,
        pkce_enforced: client.pkce_enforced,
        landing_page_url: client.landing_page_url
    };
}
