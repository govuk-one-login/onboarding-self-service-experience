import DynamoDbClient from "../../dynamodb-client";
import {Updates} from "../../dynamodb-client";
import {handlerInvokeEvent} from "../handler-utils";

const client = new DynamoDbClient();

export type clientRegistryUpdateResponse = {
    serviceId: string;
    selfServiceClientId: string;
    clientId: string;
    updates: Updates;
};
//This lambda is called by the step function after updating the Client registry
//Given we authorise the user before we call the step function, there is no need
//to implement additional authorisation here
export const updateServiceClientHandler = async (event: handlerInvokeEvent): Promise<{statusCode: number; body: string}> => {
    const payload: clientRegistryUpdateResponse = JSON.parse(event.body);

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
