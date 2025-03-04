const getCodeBlockMock = jest.fn();
const putCodeBlockMock = jest.fn();
const deleteCodeBlockMock = jest.fn();

jest.mock("../../../src/handlers/dynamodb/code-block-service", () => ({
    getCodeBlock: getCodeBlockMock,
    putCodeBlock: putCodeBlockMock,
    deleteCodeBlock: deleteCodeBlockMock
}));

import {constructTestApiGatewayEvent, mockLambdaContext} from "../utils";
import {handler} from "../../../src/handlers/code-block/code-block-handler";

describe("Code Block handler tests", () => {
    it("rejects non post requests", async () => {
        const event = {...constructTestApiGatewayEvent(), httpMethod: "GET"};

        const response = await handler(event, mockLambdaContext);

        expect(response).toStrictEqual({
            statusCode: 405,
            body: "GET not allowed"
        });
    });

    it("rejects no event body", async () => {
        const event = {...constructTestApiGatewayEvent(), httpMethod: "POST", body: null};

        const response = await handler(event, mockLambdaContext);

        expect(response).toStrictEqual({
            statusCode: 400,
            body: "Invalid request"
        });
    });

    it("rejects invalid JSON", async () => {
        const event = {...constructTestApiGatewayEvent(), httpMethod: "POST", body: "NotJson"};

        const response = await handler(event, mockLambdaContext);

        expect(response).toStrictEqual({
            statusCode: 400,
            body: "Invalid request"
        });
    });

    it("rejects invalid code request bodies", async () => {
        const event = {...constructTestApiGatewayEvent(), httpMethod: "POST", body: "{}"};

        const response = await handler(event, mockLambdaContext);

        expect(response).toStrictEqual({
            statusCode: 400,
            body: "Invalid request"
        });
    });

    it("gets if the path is /code-block/get", async () => {
        const codeBlockId = "email:code:block:1234";

        getCodeBlockMock.mockResolvedValue(true);

        const event = {
            ...constructTestApiGatewayEvent(),
            httpMethod: "POST",
            body: JSON.stringify({
                id: codeBlockId
            }),
            path: "/code-block/get"
        };

        const response = await handler(event, mockLambdaContext);

        expect(getCodeBlockMock).toHaveBeenCalledWith(codeBlockId);
        expect(response).toStrictEqual({
            statusCode: 200,
            body: JSON.stringify({
                blocked: true
            })
        });
    });

    it("puts if the path is /code-block/put", async () => {
        const codeBlockId = "email:code:block:1234";

        putCodeBlockMock.mockResolvedValue(void 0);

        const event = {
            ...constructTestApiGatewayEvent(),
            httpMethod: "POST",
            body: JSON.stringify({
                id: codeBlockId
            }),
            path: "/code-block/put"
        };

        const response = await handler(event, mockLambdaContext);

        expect(putCodeBlockMock).toHaveBeenCalledWith(codeBlockId);
        expect(response).toStrictEqual({
            statusCode: 204,
            body: ""
        });
    });

    it("deletes if the path is /code-block/delete", async () => {
        const codeBlockId = "email:code:block:1234";

        deleteCodeBlockMock.mockResolvedValue(void 0);

        const event = {
            ...constructTestApiGatewayEvent(),
            httpMethod: "POST",
            body: JSON.stringify({
                id: codeBlockId
            }),
            path: "/code-block/delete"
        };

        const response = await handler(event, mockLambdaContext);

        expect(deleteCodeBlockMock).toHaveBeenCalledWith(codeBlockId);
        expect(response).toStrictEqual({
            statusCode: 204,
            body: ""
        });
    });

    it("returns a 404 for unknown path", async () => {
        const codeBlockId = "email:code:block:1234";

        deleteCodeBlockMock.mockResolvedValue(void 0);

        const event = {
            ...constructTestApiGatewayEvent(),
            httpMethod: "POST",
            body: JSON.stringify({
                id: codeBlockId
            }),
            path: "/code-block/notValid"
        };

        const response = await handler(event, mockLambdaContext);

        expect(getCodeBlockMock).not.toHaveBeenCalled();
        expect(putCodeBlockMock).not.toHaveBeenCalled();
        expect(deleteCodeBlockMock).not.toHaveBeenCalled();

        expect(response).toStrictEqual({
            statusCode: 404,
            body: "Not Found"
        });
    });
});
