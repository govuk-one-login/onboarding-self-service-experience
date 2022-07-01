import DynamoClient from "../client/DynamoClient";

const tableName = process.env.TABLE;
const client = new DynamoClient(tableName as string);


export const updateServiceClientHandler = async (event: any): Promise<any> => {
    const body = JSON.parse(event.body);
    let response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .updateClient(body.serviceId, body.selfServiceClientId, body.updates)
        .then((updateItemCommandOutput) => {
            response.statusCode = 200;
            response.body = JSON.stringify(updateItemCommandOutput)
        })
        .catch((putItemOutput) => {
            console.log(putItemOutput)
            response.statusCode = 500;
            response.body = JSON.stringify(putItemOutput)
        });

    return response;
};

