import sinon from "sinon";
import axios from "axios";
import {RegisterClientPayload, registerClientHandler} from "../../../src/handlers/auth/register-client";
import {mockLambdaContext} from "../utils";

const postRequest = async (data: RegisterClientPayload): Promise<string> => {
    const result = await registerClientHandler(data, mockLambdaContext);
    return JSON.stringify(result);
};

const EXPECTED_GOOD_RESPONSE =
    '{"statusCode":200,"body":"{\\"client_name\\":\\"My test service\\",\\"public_key\\":\\"MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=\\",\\"redirect_uris\\":[\\"http://localhost/\\"],\\"contacts\\":[\\"pacttest.account@digital.cabinet-office.gov.uk\\"],\\"scopes\\":[\\"openid\\",\\"email\\",\\"phone\\"],\\"subject_type\\":\\"pairwise\\",\\"service_type\\":\\"MANDATORY\\",\\"sector_identifier_uri\\":\\"http://gov.uk\\",\\"clientId\\":\\"123\\",\\"contactEmail\\":\\"pacttest.account@digital.cabinet-office.gov.uk\\",\\"service\\":{\\"serviceName\\":\\"My test service\\",\\"id\\":\\"service#testRandomId\\"}}"}';

const EXPECTED_BAD_RESPONSE =
    '{"statusCode":200,"body":"{\\"client_name\\":\\"My test service\\",\\"public_key\\":\\"MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAp2mLkQGo24Kz1rut0oZlviMkGomlQCH+iT1pFvegZFXq39NPjRWyatmXp/XIUPqCq9Kk8/+tq4Sgjw+EM5tATJ06j5r+35of58ATGVPniW//IhGizrv6/ebGcGEUJ0Y/ZmlCHYPV+lbewpttQ/IYKM1nr3k/Rl6qepbVYe+MpGubluQvdhgUYel9OzxiOvUk7XI0axPquiXzoEgmNNOai8+WhYTkBqE3/OucAv+XwXdnx4XHmKzMwTv93dYMpUmvTxWcSeEJ/4/SrbiK4PyHWVKU2BozfSUejVNhahAzZeyyDwhYJmhBaZi/3eOOlqGXj9UdkOXbl3vcwBH8wD30O9/4F5ERLKxzOaMnKZ+RpnygWF0qFhf+UeFMy+O06sdgiaFnXaSCsIy/SohspkKiLjNnhvrDNmPLMQbQKQlJdcp6zUzI7Gzys7luEmOxyMpA32lDBQcjL7KNwM15s4ytfrJ46XEPZUXESce2gj6NazcPPsrTa/Q2+oLS9GWupGh7AgMBAAE=\\",\\"redirect_uris\\":[\\"http://localhost/\\"],\\"contacts\\":[\\"pacttest.account@digital.cabinet-office.gov.uk\\"],\\"scopes\\":[\\"openid\\",\\"email\\",\\"phone\\"],\\"subject_type\\":\\"pairwise\\",\\"service_type\\":\\"MANDATORY\\",\\"sector_identifier_uri\\":\\"http://gov.uk\\",\\"contactEmail\\":\\"pacttest.account@digital.cabinet-office.gov.uk\\",\\"service\\":{\\"serviceName\\":\\"My test service\\",\\"id\\":\\"service#testRandomId\\"}}"}';

describe("exercise register-client api", () => {
    let axiosPostStub: sinon.SinonStub;
    let consoleErrorStub: sinon.SinonStub;

    const createClientRequest = {
        contactEmail: "pacttest.account@digital.cabinet-office.gov.uk",
        service: {
            serviceName: "My test service",
            id: "service#testRandomId"
        }
    };

    beforeEach(() => {
        axiosPostStub = sinon.stub(axios, "post");
        consoleErrorStub = sinon.stub(console, "error");
    });

    afterEach(() => {
        axiosPostStub.restore();
        consoleErrorStub.restore();
    });

    it("should return the data for a successful create", async () => {
        const mockResponse = {
            data: {
                clientId: "123"
            }
        };

        axiosPostStub.resolves(mockResponse);

        const result = await postRequest(createClientRequest);
        expect(result).toEqual(EXPECTED_GOOD_RESPONSE);
    });

    it("should handle errors gracefully", async () => {
        const mockResponse = {
            status: 400
        };

        axiosPostStub.resolves(mockResponse);

        const result = await postRequest(createClientRequest);
        expect(result).toEqual(EXPECTED_BAD_RESPONSE);
    });
});
