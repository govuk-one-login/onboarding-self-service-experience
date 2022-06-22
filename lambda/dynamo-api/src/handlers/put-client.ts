import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import DynamoClient from "../client/DynamoClient";

const tableName = process.env.SAMPLE_TABLE;
const client = new DynamoClient(tableName as string);


export const putClientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const payload = JSON.parse(event.body as string);

    let record = {
        pk: payload.clientId,
        sk: payload.clientId,
        data: payload.authClientId,
        public_key: 'PUBLIC KEY',
        redirect_uris: ['http://localhost/'],
        contacts: [payload.contactEmail],
        scopes: ['openid', 'email', 'phone'],
        post_logout_redirect_uris: ['http://localhost/'],
        subject_type: 'pairwise',
        service_type: 'MANDATORY',
        default_fields: ['data','redirect_uris','scopes','post_logout_redirect_uris','subject_type','service_type']
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

