import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import axios, { Axios } from "axios"; // TODO: Until Onboarding takes over client registry / just for now

let instance: Axios;

instance = axios.create({
    baseURL: process.env.AUTH_REGISTRATION_BASE_URL,
    headers: {
        "Content-Type": "application/json"
    }
});

export const registerClientHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    let payload: any = event;

    const public_key = 'MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=';
    const redirect_uris = ['http://localhost/'];
    const scopes = ['openid', 'email', 'phone'];
    const post_logout_redirect_uris = ['http://localhost/'];
    const subject_type = 'pairwise';
    const service_type = 'MANDATORY';
    const sector_identifier_uri = 'http://localhost/';

    let clientConfig = {
        client_name: payload.service.serviceName,
        public_key: public_key,
        redirect_uris: redirect_uris,
        contacts: [payload.contactEmail, "onboarding@digital.cabinet-office.gov.uk"],
        scopes: scopes,
        post_logout_redirect_uris: post_logout_redirect_uris,
        subject_type: subject_type,
        service_type: service_type,
        sector_identifier_uri: sector_identifier_uri
    }

    const result = await (await instance).post("/connect/register", JSON.stringify(clientConfig));
    const body = {...clientConfig, ...result.data, ...payload};

    return {
        statusCode: 200,
        body: JSON.stringify(body)
    };
}
