import axios, {AxiosError, AxiosResponse} from "axios";
import {UpdateClientPayload, updateClientInRegistryHandler, logger} from "../../../src/handlers/auth/update-client";
import {mockLambdaContext} from "../utils";

const postRequest = async (data: UpdateClientPayload): Promise<string> => {
    const result = await updateClientInRegistryHandler(data, mockLambdaContext);
    return JSON.stringify(result);
};

const EXPECTED_RESPONSE =
    '{"statusCode":200,"body":"{\\"clientId\\":\\"123\\",\\"updates\\":{\\"serviceName\\":\\"My test service\\"},\\"serviceId\\":\\"456\\",\\"selfServiceClientId\\":\\"789\\"}"}';

describe("exercise update-client api", () => {
    let axiosPutStub: jest.SpyInstance;
    let consoleErrorStub: jest.SpyInstance;

    const updateClientRequest = {
        clientId: "123",
        serviceId: "456",
        selfServiceClientId: "789",
        updates: {
            serviceName: "My test service"
        }
    };

    beforeEach(() => {
        axiosPutStub = jest.spyOn(axios, "put");
        consoleErrorStub = jest.spyOn(logger, "error");
    });

    afterEach(() => {
        axiosPutStub.mockRestore();
        consoleErrorStub.mockRestore();
    });

    it("should return the data for a successful update", async () => {
        const mockResponse = {
            status: 200,
            data: {
                clientId: "123"
            }
        };

        axiosPutStub.mockResolvedValue(mockResponse);

        const result = await postRequest(updateClientRequest);
        expect(result).toEqual(EXPECTED_RESPONSE);
    });

    it("should log the status and throw an axios error", async () => {
        const axiosError = new AxiosError();
        axiosError.response = {
            status: 400,
            data: "Invalid Request"
        } as AxiosResponse;

        axiosPutStub.mockRejectedValue(axiosError);

        await expect(postRequest(updateClientRequest)).rejects.toThrow(AxiosError);
        expect(consoleErrorStub).toHaveBeenCalledWith("Client registry request failed with response.", axiosError);
    });

    it("should throw an non axios error", async () => {
        const error = new Error("somethingNotAnAxiosOne");
        axiosPutStub.mockRejectedValue(error);

        await expect(postRequest(updateClientRequest)).rejects.toThrow(error);
    });
});
