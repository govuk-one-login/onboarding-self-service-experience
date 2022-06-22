import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import DynamoClient from "../client/DynamoClient";
import {randomUUID} from "crypto";

const tableName = process.env.SAMPLE_TABLE;
const client = new DynamoClient(tableName as string);


export const putClientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const payload: any = JSON.parse((event as any).body);
    console.log("Payload")
    console.log(payload);
    const clientId = `client#${randomUUID()}`;
    let record = {
        pk: clientId,
        sk: clientId,
        data: payload.client_id,
        public_key: payload.public_key,
        redirect_uris: payload.redirect_uris,
        contacts: payload.contacts,
        scopes: payload.scopes,
        post_logout_redirect_uris: payload.post_logout_redirect_uris,
        subject_type: payload.subject_type,
        service_type: payload.service_type,
        default_fields: ['data', 'public_key', 'redirect_uris','scopes','post_logout_redirect_uris','subject_type','service_type']
    };

    let response = {statusCode: 200, body: JSON.stringify("OK")};
    await client
        .put(record)
        .then((putItemOutput) => {
            response.statusCode = 200;
            response.body = JSON.stringify({...record, ...payload});
        })
        .catch((putItemOutput) => { response.statusCode = 500; response.body = JSON.stringify(putItemOutput)});

    return response;
};

