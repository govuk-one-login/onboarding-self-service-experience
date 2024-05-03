import {APIGatewayProxyResult} from "aws-lambda";
import DynamoDbClient from "../../dynamodb-client";
import {randomUUID} from "crypto";
import {OnboardingTableItem} from "../../onboarding-table-item";
import {handlerInvokeEvent} from "../handler-utils";

const client = new DynamoDbClient();

export type clientRegistryRegistrationResponse = {
    client_name: string;
    public_key: string;
    redirect_uris: string[];
    contacts: string[];
    scopes: string[];
    subject_type: string;
    service_type: string;
    sector_identifier_uri: string;
    client_id: string;
    post_logout_redirect_uris: string[];
    back_channel_logout_uri: null | string;
    token_endpoint_auth_method: string;
    response_type: string;
    jar_validation_required: boolean;
    claims: string[];
    client_type: string;
    service: {
        id: string;
        serviceName: string;
    };
    contact_email: string;
    id_token_signing_algorithm: "ES256" | "RS256";
    client_locs: string[];
};

export const putServiceClientHandler = async (event: handlerInvokeEvent): Promise<APIGatewayProxyResult> => {
    const payload: clientRegistryRegistrationResponse = JSON.parse(event.body);

    const record: OnboardingTableItem = {
        pk: payload.service.id,
        sk: `client#${randomUUID()}`,
        clientId: payload.client_id,
        type: "integration",
        public_key: payload.public_key,
        redirect_uris: payload.redirect_uris,
        contacts: payload.contacts,
        scopes: payload.scopes,
        subject_type: payload.subject_type,
        service_type: payload.service_type,
        client_name: "integration",
        service_name: payload.service.serviceName,
        identity_verification_enabled: false,
        claims: [],
        back_channel_logout_uri: payload.back_channel_logout_uri,
        sector_identifier_uri: payload.sector_identifier_uri,
        token_endpoint_auth_method: payload.token_endpoint_auth_method,
        id_token_signing_algorithm: payload.hasOwnProperty("id_token_signing_algorithm") ? payload.id_token_signing_algorithm : "",
        client_locs: payload.hasOwnProperty("client_locs") ? payload.client_locs : [],
        default_fields: [
            "data",
            "public_key",
            "redirect_uris",
            "scopes",
            "post_logout_redirect_uris",
            "subject_type",
            "service_type",
            "identity_verification_enabled",
            "claims",
            "sector_identifier_uri",
            "back_channel_logout_uri",
            "token_endpoint_auth_method",
            "id_token_signing_algorithm"
        ]
    };

    const response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(record)
        .then(() => {
            console.log("Successfully published client to dynamo");
            response.statusCode = 200;
            response.body = JSON.stringify(record);
        })
        .catch(putItemOutput => {
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput);
        });

    return response;
};
