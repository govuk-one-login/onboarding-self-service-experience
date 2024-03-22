import sinon from "sinon";
import axios from "axios";
import {UpdateClientPayload, updateClientInRegistryHandler} from "../../../src/handlers/auth/update-client";

const postRequest = async (data: UpdateClientPayload): Promise<string> => {
    const result = await updateClientInRegistryHandler(data);
    return JSON.stringify(result);
};

const EXPECTED_RESPONSE =
    '{"statusCode":200,"body":"{\\"clientId\\":\\"123\\",\\"updates\\":{\\"serviceName\\":\\"My test service\\"},\\"serviceId\\":\\"456\\",\\"selfServiceClientId\\":\\"789\\"}"}';

const EXPECTED_BAD_RESPONSE =
    '{"statusCode":200,"body":"{\\"updates\\":{\\"serviceName\\":\\"My test service\\"},\\"serviceId\\":\\"456\\",\\"selfServiceClientId\\":\\"789\\"}"}';

describe("exercise update-client api", () => {
    let axiosPutStub: sinon.SinonStub;
    let consoleErrorStub: sinon.SinonStub;

    const updateClientRequest = {
        clientId: "123",
        serviceId: "456",
        selfServiceClientId: "789",
        updates: {
            serviceName: "My test service"
        }
    };

    beforeEach(() => {
        axiosPutStub = sinon.stub(axios, "put");
        consoleErrorStub = sinon.stub(console, "error");
    });

    afterEach(() => {
        axiosPutStub.restore();
        consoleErrorStub.restore();
    });

    it("should return the data for a successful update", async () => {
        const mockResponse = {
            data: {
                clientId: "123"
            }
        };

        axiosPutStub.resolves(mockResponse);

        const result = await postRequest(updateClientRequest);
        expect(result).toEqual(EXPECTED_RESPONSE);
    });

    it("should handle errors gracefully", async () => {
        const mockResponse = {
            status: 400
        };

        axiosPutStub.resolves(mockResponse);

        const result = await postRequest(updateClientRequest);
        expect(result).toEqual(EXPECTED_BAD_RESPONSE);
    });
});
