import {updateServiceClientHandler} from "../../../src/handlers/dynamodb/update-service-client";
import DynamoDbClient from "../../../src/dynamodb-client";
import ResolvedValue = jest.ResolvedValue;

const randomId = "1234Random";
jest.mock("crypto", () => ({
    randomUUID: jest.fn(() => randomId)
}));

const testRegistrationResponse = {
    updates: {
        post_logout_redirect_uris: ["http://localhost/home"],
        claims: ["claim 1", "claim 2"]
    },
    serviceId: "1ded3d65-d088-4319-9431-ea5a3323799d",
    selfServiceClientId: "570278c3-a5fd-4825-a8cf-bfdf578ee7a5"
};

function createResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>{
        serviceId: "1ded3d65-d088-4319-9431-ea5a3323799d",
        selfServiceClientId: "570278c3-a5fd-4825-a8cf-bfdf578ee7a5"
    };
}

const resolvedBody = '{"serviceId":"1ded3d65-d088-4319-9431-ea5a3323799d","selfServiceClientId":"570278c3-a5fd-4825-a8cf-bfdf578ee7a5"}';

describe("updateServiceClientHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a update command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "updateClient").mockResolvedValue(createResolvedValue());

        const updateServiceHandlerResponse = await updateServiceClientHandler({
            statusCode: 200,
            body: JSON.stringify(testRegistrationResponse)
        });

        expect(itemSpy).toHaveBeenCalledWith(
            testRegistrationResponse.serviceId,
            testRegistrationResponse.selfServiceClientId,
            testRegistrationResponse.updates
        );

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a update command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "updateClient").mockRejectedValue(error);

        const updateServiceHandlerResponse = await updateServiceClientHandler({
            statusCode: 200,
            body: JSON.stringify(testRegistrationResponse)
        });

        expect(itemSpy).toHaveBeenCalledWith(
            testRegistrationResponse.serviceId,
            testRegistrationResponse.selfServiceClientId,
            testRegistrationResponse.updates
        );

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });
});
