import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import DynamoClient from "../client/DynamoClient";

const tableName = process.env.SAMPLE_TABLE;
const client = new DynamoClient(tableName as string);


export const putServiceClientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const payload = JSON.parse(event.body as string);

    let record = {
        pk: payload.serviceId,
        sk: payload.clientId,
        data: `${payload.serviceName} test client`,
        type: 'integration'
    };

    let response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(record)
        .then((putItemOutput) => {
            response.statusCode = 200;
            response.body = JSON.stringify(putItemOutput)
        })
        .catch((putItemOutput) => { response.statusCode = 500; response.body = JSON.stringify(putItemOutput)});

    return response;
};

