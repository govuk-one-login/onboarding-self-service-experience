import DynamoDbClient, {Updates} from "../../dynamodb-client";

const client = new DynamoDbClient();

export type updateServicePayload = {
    serviceId: string;
    selfServiceClientId: string;
    clientId: string;
    updates: Updates;
};

export type updateServiceHandlerInvokeEvent = {
    statusCode: number;
    body: string;
};

export const updateServiceHandler = async (event: updateServiceHandlerInvokeEvent): Promise<{statusCode: number; body: string}> => {
    const payload: updateServicePayload = JSON.parse(event.body);
    const response = {statusCode: 200, body: JSON.stringify("OK")};

    await client
        .updateService(payload.serviceId, payload.updates)
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
