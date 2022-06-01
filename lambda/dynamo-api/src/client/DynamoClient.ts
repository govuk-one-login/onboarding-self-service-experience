import {DynamoDBClient, PutItemCommand, PutItemCommandOutput, GetItemCommand, GetItemCommandOutput, QueryCommand, QueryCommandOutput} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {OnboardingTableItem} from "../@Types/OnboardingTableItem";

class DynamoClient {
    private dynamodb: DynamoDBClient;
    private readonly tableName: string;

    constructor(tableName: string) {
        this.dynamodb = new DynamoDBClient({ region: process.env.AWS_REGION });
        this.tableName = tableName;
    }

    async put(item: OnboardingTableItem): Promise<PutItemCommandOutput> {
        const params  = {
            TableName: this.tableName,
            Item: marshall(item)
        };
        const command = new PutItemCommand(params);
        return await this.dynamodb.send(command);
    }

    async queryBySortKey(sortKey: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            IndexName: 'sk-index',
            ExpressionAttributeValues: {":sortKey": {S: sortKey}},
            KeyConditionExpression: "sk = :sortKey"
        }
        console.log(params);
        const command = new QueryCommand(params);
        return await this.dynamodb.send(command);
    }

    async queryBySortKeyAndUnmarshal(sortKey: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            IndexName: 'sk-index',
            ExpressionAttributeValues: {":sortKey": {S: sortKey}},
            KeyConditionExpression: "sk = :sortKey"
        }
        console.log(params);
        const command = new QueryCommand(params);
        return await this.dynamodb.send(command);
    }
}

export default DynamoClient;