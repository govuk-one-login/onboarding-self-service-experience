import {DeleteItemCommand, DynamoDBClient, GetItemCommand, PutItemCommand} from "@aws-sdk/client-dynamodb";
import {CodeBlockEntry} from "../types/code-block-entry";
import {getEnvOrThrow} from "../helper/getEnv";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {logger} from "../helper/logger";

const dynamoClient = new DynamoDBClient();
export const CODE_BLOCK_TTL = 60 * 60; // 1 Hour in seconds
const nowInSeconds = () => Date.now() / 1000;
//Dynamo TTL are in seconds
const getTtl = () => nowInSeconds() + CODE_BLOCK_TTL;

export const getCodeBlock = async (codeBlockId: string): Promise<boolean> => {
    logger.info("Getting code block entry");
    const codeBlockEntry = await dynamoClient.send(
        new GetItemCommand({
            TableName: getEnvOrThrow("CODE_BLOCK_TABLE_NAME"),
            Key: marshall({
                CodeBlockIdentifier: codeBlockId
            })
        })
    );

    if (!codeBlockEntry.Item) {
        return false;
    }

    return (unmarshall(codeBlockEntry.Item) as CodeBlockEntry).ttl > Date.now() / 1000;
};

export const putCodeBlock = async (codeBlockId: string): Promise<void> => {
    logger.info("Putting code block entry");

    await dynamoClient.send(
        new PutItemCommand({
            TableName: getEnvOrThrow("CODE_BLOCK_TABLE_NAME"),
            Item: marshall({CodeBlockIdentifier: codeBlockId, ttl: getTtl()})
        })
    );
    return;
};

export const deleteCodeBlock = async (codeBlockId: string): Promise<void> => {
    logger.info("Removing code block entry");
    await dynamoClient.send(
        new DeleteItemCommand({
            TableName: getEnvOrThrow("CODE_BLOCK_TABLE_NAME"),
            Key: marshall({
                CodeBlockIdentifier: codeBlockId
            })
        })
    );

    return;
};
