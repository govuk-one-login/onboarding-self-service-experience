import {updateServiceHandler} from "../../../src/handlers/dynamodb/update-service";
import DynamoDbClient from "../../../src/dynamodb-client";
import ResolvedValue = jest.ResolvedValue;

const randomId = "1234Random";
jest.mock("crypto", () => ({
    randomUUID: jest.fn(() => randomId)
}));

const updateServiceHandlerBody = {
    updates: {
        serviceName: "New Test Service"
    },
    serviceId: "1ded3d65-d088-4319-9431-ea5a3323799d"
};

function createResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>{
        serviceId: updateServiceHandlerBody.serviceId,
        selfServiceClientId: "570278c3-a5fd-4825-a8cf-bfdf578ee7a5"
    };
}

const resolvedBody = '{"serviceId":"1ded3d65-d088-4319-9431-ea5a3323799d","selfServiceClientId":"570278c3-a5fd-4825-a8cf-bfdf578ee7a5"}';

describe("updateServiceHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a update command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "updateService").mockResolvedValue(createResolvedValue());

        const updateServiceHandlerResponse = await updateServiceHandler({
            statusCode: 200,
            body: JSON.stringify(updateServiceHandlerBody)
        });

        expect(itemSpy).toHaveBeenCalledWith(updateServiceHandlerBody.serviceId, updateServiceHandlerBody.updates);

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: resolvedBody
        });
    });

    it("calls the dynamo client with a update command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "updateService").mockRejectedValue(error);

        const updateServiceHandlerResponse = await updateServiceHandler({
            statusCode: 200,
            body: JSON.stringify(updateServiceHandlerBody)
        });

        expect(itemSpy).toHaveBeenCalledWith(updateServiceHandlerBody.serviceId, updateServiceHandlerBody.updates);

        expect(updateServiceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });
});
