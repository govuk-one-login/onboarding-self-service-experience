import DynamoDbClient from "../../../src/dynamodb-client";
import {getServiceClientsHandler} from "../../../src/handlers/dynamodb/get-service-clients";
import {TEST_ACCESS_TOKEN, TEST_SERVICE_ID, TEST_USER_ID} from "../constants";
import {constructTestApiGatewayEvent} from "../utils";

const VALID_GET_CLIENT_REQUEST = constructTestApiGatewayEvent({
    body: "",
    pathParameters: {serviceId: TEST_SERVICE_ID},
    headers: {Authorization: "Bearer " + TEST_ACCESS_TOKEN}
});

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

    it("returns a 400 when the authorization header is invalid", async () => {
        const testApiEvent = constructTestApiGatewayEvent({
            body: "",
            pathParameters: {serviceId: TEST_SERVICE_ID},
            headers: {Authorization: "Bearer invalid"}
        });
        const getServiceClientsResponse = await getServiceClientsHandler(testApiEvent);

        expect(getServiceClientsResponse).toStrictEqual({
            statusCode: 400,
            body: "Invalid access token"
        });
    });

    it("returns 403 when the user is not authorised", async () => {
        const checkServiceUserExistsSpy = jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(false);

        const getServiceClientsResponse = await getServiceClientsHandler(VALID_GET_CLIENT_REQUEST);
        expect(checkServiceUserExistsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID, TEST_USER_ID);
        expect(getServiceClientsResponse).toStrictEqual({
            statusCode: 403,
            body: "Forbidden"
        });
    });

    it("returns the clients when they are returned from dynamo", async () => {
        jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(true);
        const testDynamoResponse = {
            $metadata: {},
            Items: []
        };
        const getClientsSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockResolvedValue(testDynamoResponse);

        const getServiceClientsResponse = await getServiceClientsHandler(VALID_GET_CLIENT_REQUEST);

        expect(getServiceClientsResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(testDynamoResponse)
        });

        expect(getClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
    });

    it("returns an error response when the dynamo query throws an error", async () => {
        jest.spyOn(DynamoDbClient.prototype, "checkServiceUserExists").mockResolvedValue(true);
        const dynamoErr = "someDynamoError";
        const getClientsSpy = jest.spyOn(DynamoDbClient.prototype, "getClients").mockRejectedValue(dynamoErr);

        const getServiceClientsResponse = await getServiceClientsHandler(VALID_GET_CLIENT_REQUEST);

        expect(getServiceClientsResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(dynamoErr)
        });
        expect(getClientsSpy).toHaveBeenCalledWith(TEST_SERVICE_ID);
    });
});
