import DynamoDbClient from "../../dynamodb-client";
import {handlerInvokeEvent, handlerResult} from "../handler-utils";

const client = new DynamoDbClient();

export const putServiceHandler = async (event: handlerInvokeEvent): Promise<handlerResult> => {
    const payload = event?.body ? JSON.parse(event.body as string) : event;

    const response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put({
            pk: payload.service.id,
            sk: payload.service.id,
            data: payload.service.serviceName,
            service_name: payload.service.serviceName
        })
        .then(putItemOutput => {
            response.statusCode = 200;
            response.body = JSON.stringify(putItemOutput);
        })
        .catch(putItemOutput => {
            console.error(putItemOutput), (response.statusCode = 500);
            response.body = JSON.stringify(putItemOutput);
        });

    return response;
};
