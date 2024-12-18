import {Context, APIGatewayProxyResult} from "aws-lambda";
import axios from "axios";
import {Logger} from "@aws-lambda-powertools/logger";

export const logger = new Logger({
    serviceName: "self-service-experience"
});

export type RegisterClientPayload = {
    service: {
        serviceName: string;
        id: string;
    };
    contactEmail: string;
};

export const public_key =
    "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=";

// Handler is invoked by step function not API Gateway
//The event type is not APIGatewayProxyEvent but the custom JSON payload from the step function invoke
export const registerClientHandler = async (event: RegisterClientPayload, context: Context): Promise<APIGatewayProxyResult> => {
    logger.addContext(context);

    const redirect_uris = ["http://localhost/"];
    const scopes = ["openid", "email", "phone"];
    const subject_type = "pairwise";
    const service_type = "MANDATORY";
    const sector_identifier_uri = "http://gov.uk";
    const client_locs = ["P2"];

    const clientConfig = {
        client_name: event.service.serviceName,
        public_key: public_key,
        redirect_uris: redirect_uris,
        contacts: [event.contactEmail],
        scopes: scopes,
        subject_type: subject_type,
        service_type: service_type,
        sector_identifier_uri: sector_identifier_uri,
        client_locs: client_locs
    };

    const url = process.env.AUTH_REGISTRATION_BASE_URL + "/connect/register";
    const result = await axios
        .post(url, JSON.stringify(clientConfig), {
            headers: {
                "Content-Type": "application/json",
                "X-API-Key": process.env.AUTH_API_KEY as string
            }
        })
        .catch(error => {
            logger.error("Client registry request failed with response.", error as Error);
            throw error;
        });

    const body = {...clientConfig, ...result.data, ...event};

    return {
        statusCode: 200,
        body: JSON.stringify(body)
    };
};
