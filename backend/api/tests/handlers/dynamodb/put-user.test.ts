import {putUserHandler} from "../../../src/handlers/dynamodb/put-user";
import DynamoDbClient from "../../../src/dynamodb-client";
import ResolvedValue = jest.ResolvedValue;

const randomId = "1234Random";
jest.mock("crypto", () => ({
    randomUUID: jest.fn(() => randomId)
}));

const putServiceHandlerBody = {
    id: "123",
    fullName: "Jane Jones",
    firstName: "Jane",
    lastName: "Jones",
    email: "jane.jones@test.gov.uk",
    mobileNumber: undefined,
    passwordLastUpdated: "01/01/2024"
};

const expectedDynamoRecord = {
    id: putServiceHandlerBody.id,
    fullName: putServiceHandlerBody.fullName,
    firstName: putServiceHandlerBody.firstName,
    lastName: putServiceHandlerBody.lastName,
    email: putServiceHandlerBody.email,
    mobileNumber: putServiceHandlerBody.mobileNumber,
    passwordLastUpdated: putServiceHandlerBody.passwordLastUpdated
};

function createResolvedValue(): ResolvedValue<string> {
    return <ResolvedValue<string>>expectedDynamoRecord;
}

describe("putUserHandler tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("calls the dynamo client with a put command with the expected values and returns a 200 with the expected response body", async () => {
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockResolvedValue(createResolvedValue());

        const putServiceHandlerResponse = await putUserHandler({
            statusCode: 200,
            body: JSON.stringify(putServiceHandlerBody)
        });

        expect(itemSpy).toHaveBeenCalledWith(expectedDynamoRecord);
        expect(putServiceHandlerResponse).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify(expectedDynamoRecord)
        });
    });

    it("calls the dynamo client with a put command with the expected values and returns a 500 when the dynamo client throws an error", async () => {
        const error = "SomeAwsError";
        const itemSpy = jest.spyOn(DynamoDbClient.prototype, "put").mockRejectedValue(error);

        const putServiceHandlerResponse = await putUserHandler({
            statusCode: 200,
            body: JSON.stringify(putServiceHandlerBody)
        });

        expect(itemSpy).toHaveBeenCalledWith(expectedDynamoRecord);
        expect(putServiceHandlerResponse).toStrictEqual({
            statusCode: 500,
            body: JSON.stringify(error)
        });
    });
});
