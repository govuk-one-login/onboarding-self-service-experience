import DynamoDbClient from "../../../src/dynamodb-client";
import {getServiceClientsHandler} from "../../../src/handlers/dynamodb/get-service-clients";
import {TEST_SERVICE_ID} from "../constants";
import {constructTestApiGatewayEvent} from "../utils";

describe("getServiceClientsHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("returns the expected response when no userId is provided in the pathParameters", async () => {
        const getClientsSpy = jest.spyOn(DynamoDbClient.prototype, "getClients");
        const getServiceClientsResponse = await getServiceClientsHandler(constructTestApiGatewayEvent());

        expect(getServiceClientsResponse).toStrictEqual({
            statusCode: 400,
            body: "No serviceId request parameter supplied"
        });

        expect(getClientsSpy).not.toHaveBeenCalled();
    });

    it("returns a 401 and Missing access token when no authorization header is present", async () => {
        const testApiEvent = constructTestApiGatewayEvent({body: "", pathParameters: {serviceId: TEST_SERVICE_ID}});
        const getServiceClientsResponse = await getServiceClientsHandler(testApiEvent);

        expect(getServiceClientsResponse).toStrictEqual({
            statusCode: 401,
            body: "Missing access token"
        });
    });

    // it("returns the clients when they are returned from dynamo", async () => {
    //     const testDynamoResponse = {
    //         $metadata: {},
    //         Items: []
    //     };
    //     const getClientsSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockResolvedValue(testDynamoResponse);

    //     const testApiEvent = constructTestApiGatewayEvent({
    //         body: "",
    //         pathParameters: {serviceId: TEST_SERVICE_ID},
    //         headers: {Authorization: ""}
    //     });
    //     const getServiceClientsResponse = await getServiceClientsHandler(testApiEvent);

    //     expect(getServiceClientsResponse).toStrictEqual({
    //         statusCode: 200,
    //         body: JSON.stringify(testDynamoResponse)
    //     });

    //     expect(getClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
    // });

    // it("returns an error response when the dynamo query throws an error", async () => {
    //     const dynamoErr = "someDynamoError";
    //     const getClientsSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockRejectedValue(dynamoErr);
    //     const testApiEvent = constructTestApiGatewayEvent({body: "", pathParameters: {serviceId: TEST_SERVICE_ID}});

    //     const getServiceClientsResponse = await getServiceClientsHandler(testApiEvent);

    //     expect(getServiceClientsResponse).toStrictEqual({
    //         statusCode: 500,
    //         body: JSON.stringify(dynamoErr)
    //     });
    //     expect(getClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
    // });
});
