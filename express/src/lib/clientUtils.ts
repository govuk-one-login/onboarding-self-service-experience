import {Client, ClientFromDynamo} from "../../@types/client";

export function dynamoClientToDomainClient(client: ClientFromDynamo): Client {
    return {
        dynamoId: client.pk.substring("service#".length),
        dynamoServiceId: client.sk.substring("client#".length),
        authClientId: client.clientId,
        clientName: client.client_name,
        contacts: client.contacts,
        defaultFields: client.default_fields,
        postLogoutUris: client.post_logout_redirect_uris || [],
        publicKey: client.public_key,
        redirectUris: client.redirect_uris,
        scopes: client.scopes,
        serviceName: client.service_name,
        serviceType: client.service_type,
        subjectType: client.subject_type,
        type: client.type
    };
}
