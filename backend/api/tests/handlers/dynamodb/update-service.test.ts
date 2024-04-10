import {updateServiceHandler} from "../../../src/handlers/dynamodb/update-service";
import DynamoDbClient from "../../../src/dynamodb-client";

const testRegistrationResponse = {
    updates: {
        service_name: "My test service 123456"
    },
    serviceId: "d0786cde-4e2b-4eec-a271-3a561b8cde1e",
    clientId: "IiIznOD3UW01zmZInlOEgNYufuk"
};

describe("handlerName tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns a 200 and the stringified record in the response when the update is successful", async () => {
        const serviceUpdateResponse = {message: "All records updated successfully"};
        const updateServiceSpy = jest.spyOn(DynamoDbClient.prototype, "updateService").mockResolvedValue(serviceUpdateResponse);

        const response = await updateServiceHandler({
            statusCode: 200,
            body: JSON.stringify(testRegistrationResponse)
        });

        expect(updateServiceSpy).toHaveBeenCalledWith(testRegistrationResponse.serviceId, testRegistrationResponse.updates);
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(serviceUpdateResponse)
        });
    });

    it("returns a 500 and a stringified error when the dynamo client throws", async () => {
        const dynamoErr = "SomeDynamoErr";
        const updateServiceSpy = jest.spyOn(DynamoDbClient.prototype, "updateService").mockRejectedValue(dynamoErr);

        const response = await updateServiceHandler({
            statusCode: 200,
            body: JSON.stringify(testRegistrationResponse)
        });

        expect(updateServiceSpy).toHaveBeenCalledWith(testRegistrationResponse.serviceId, testRegistrationResponse.updates);
        expect(response).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
    });
});
