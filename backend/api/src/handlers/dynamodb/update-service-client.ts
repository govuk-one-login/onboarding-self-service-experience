import DynamoDbClient from "../../dynamodb-client";
import {Updates} from "../../dynamodb-client";

const client = new DynamoDbClient();

export type updateServiceClientPayload = {
    serviceId: string;
    selfServiceClientId: string;
    clientId: string;
    updates: Updates;
};

export type updateServiceClientHandlerInvokeEvent = {
    statusCode: number;
    body: string;
};

export const updateServiceClientHandler = async (
    event: updateServiceClientHandlerInvokeEvent
): Promise<{statusCode: number; body: string}> => {
    const payload: updateServiceClientPayload = JSON.parse(event.body);
    const response = {statusCode: 200, body: JSON.stringify("OK")};

    await client
        .updateClient(payload.serviceId, payload.selfServiceClientId, payload.updates)
        .then(updateItemCommandOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify(updateItemCommandOutput);
        })
        .catch(putItemOutput => {
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput);
        });

    return response;
};
