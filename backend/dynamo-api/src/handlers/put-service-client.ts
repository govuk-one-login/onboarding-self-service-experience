import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import DynamoClient from "../client/DynamoClient";
import {randomUUID} from "crypto";
import {OnboardingTableItem} from "../@Types/OnboardingTableItem";

const client = new DynamoClient();

export const putServiceClientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const payload = JSON.parse(event.body as string);

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
        default_fields: ["data", "public_key", "redirect_uris", "scopes", "post_logout_redirect_uris", "subject_type", "service_type"]
    };

    const response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(record)
        .then(putItemOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify(record);
        })
        .catch(putItemOutput => {
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput);
        });

    return response;
};
