import {mockClient} from "aws-sdk-client-mock";
import "aws-sdk-client-mock-jest";
import {CODE_BLOCK_TTL, deleteCodeBlock, getCodeBlock, putCodeBlock} from "../../../src/handlers/dynamodb/code-block-service";
import {DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";

const mockDynamoClient = mockClient(DynamoDBClient);

describe("code block service tests", () => {
    const TEST_TIMESTAMP = 1740577617;
    const mockTableName = "mock-Code-Block-Table";

    beforeEach(() => {
        jest.useFakeTimers().setSystemTime(TEST_TIMESTAMP);
        process.env.CODE_BLOCK_TABLE_NAME = mockTableName;
        mockDynamoClient.reset();
    });

    it("returns true for a code block entry with a TTL in the future", async () => {
        const codeBlockId = "email:code:block:123456";
        const validCodeBlock = {
            CodeBlockIdentifier: codeBlockId,
            ttl: TEST_TIMESTAMP / 1000 + 10000
        };

        mockDynamoClient
            .on(GetItemCommand, {
                Key: marshall({
                    CodeBlockIdentifier: codeBlockId
                })
            })
            .resolves({
                Item: marshall(validCodeBlock)
            });

        const isCodeBlocked = await getCodeBlock(codeBlockId);

        expect(isCodeBlocked).toBe(true);
    });

    it("returns false for a code block entry with a TTL in the past", async () => {
        const codeBlockId = "email:code:block:123456";
        const expiredCodeBlock = {
            CodeBlockIdentifier: codeBlockId,
            ttl: TEST_TIMESTAMP / 1000 - 10000
        };

        mockDynamoClient
            .on(GetItemCommand, {
                TableName: mockTableName,
                Key: marshall({
                    CodeBlockIdentifier: codeBlockId
                })
            })
            .resolves({
                Item: marshall(expiredCodeBlock)
            });
        const isCodeBlocked = await getCodeBlock(codeBlockId);

        expect(isCodeBlocked).toBe(false);
    });

    it("puts a code block entry with expected identifier", async () => {
        const codeBlockId = "email:code:block:123456";

        await putCodeBlock(codeBlockId);

        expect(mockDynamoClient).toHaveReceivedCommandWith(PutItemCommand, {
            TableName: mockTableName,
            Item: marshall({
                CodeBlockIdentifier: codeBlockId,
                ttl: TEST_TIMESTAMP / 1000 + CODE_BLOCK_TTL
            })
        });
    });

    it("deletes an existing code block", async () => {
        const codeBlockId = "email:code:block:123456";

        await deleteCodeBlock(codeBlockId);

        expect(mockDynamoClient).toHaveReceivedCommandWith(DeleteItemCommand, {
            TableName: mockTableName,
            Key: marshall({
                CodeBlockIdentifier: codeBlockId
            })
        });
    });
});
