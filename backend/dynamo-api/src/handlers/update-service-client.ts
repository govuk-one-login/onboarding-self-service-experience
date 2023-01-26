import DynamoClient from "../client/DynamoClient";

const client = new DynamoClient();

// TODO remove explicit any
export const updateServiceClientHandler = async (event: any): Promise<any> => {
    const body = JSON.parse(event.body);
    const response = {statusCode: 200, body: JSON.stringify("OK")};

    await client
        .updateClient(body.serviceId, body.selfServiceClientId, body.updates)
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
