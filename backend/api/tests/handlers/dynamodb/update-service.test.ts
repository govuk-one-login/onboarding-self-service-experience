import {constructTestApiGatewayEvent} from "../utils";
import {updateServiceHandler} from "./../../../src/handlers/dynamodb/update-service";
import DynamoDbClient from "../../../src/dynamodb-client";
import {TEST_SERVICE_ID, TEST_SERVICE_NAME} from "../constants";

const TEST_SERVICE_UPDATES = {
    serviceId: TEST_SERVICE_ID,
    updates: {
        serviceName: TEST_SERVICE_NAME
    }
};
const TEST_UPDATE_SERVICE_EVENT = constructTestApiGatewayEvent({body: JSON.stringify(TEST_SERVICE_UPDATES), pathParameters: {}});

describe("handlerName tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 200 and the stringified record in the response when the update is successful", async () => {
        const serviceUpdateResponse = {message: "All records updated successfully"};
        const updateServiceSpy = jest.spyOn(DynamoDbClient.prototype, "updateService").mockResolvedValue(serviceUpdateResponse);

        const response = await updateServiceHandler(TEST_UPDATE_SERVICE_EVENT);

        expect(updateServiceSpy).toHaveBeenCalledWith(TEST_SERVICE_UPDATES.serviceId, TEST_SERVICE_UPDATES.updates);
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(serviceUpdateResponse)
        });
    });

    it("returns a 500 and a stringified error when the dynamo client throws", async () => {
        const dynamoErr = "SomeDynamoErr";
        const updateServiceSpy = jest.spyOn(DynamoDbClient.prototype, "updateService").mockRejectedValue(dynamoErr);

        const response = await updateServiceHandler(TEST_UPDATE_SERVICE_EVENT);

        expect(updateServiceSpy).toHaveBeenCalledWith(TEST_SERVICE_UPDATES.serviceId, TEST_SERVICE_UPDATES.updates);
        expect(response).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
    });
});
