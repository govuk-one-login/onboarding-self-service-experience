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
            IndexName: 'gsi1',
            ExpressionAttributeValues: {":sortKey": {S: sortKey}},
            KeyConditionExpression: "sk = :sortKey"
        }
        console.log(params);
        const command = new QueryCommand(params);
        return await this.dynamodb.send(command);
    }

    async getServices(userId: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            IndexName: 'gsi1',
            ExpressionAttributeNames: {"#userId": "sk", "#serviceId": "pk"},
            ExpressionAttributeValues: {":userId": {S: `user#${userId}`}, ":serviceIdPrefix": {S: "service#"}},
            KeyConditionExpression: "#userId = :userId AND begins_with ( #serviceId, :serviceIdPrefix )"
        }
        console.log(params);
        const command = new QueryCommand(params);
        return await this.dynamodb.send(command);
    }

    async getClients(serviceId: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            ExpressionAttributeNames: {"#serviceId": "pk", "#clientId": "sk"},
            ExpressionAttributeValues: {":serviceId": {S: `service#${serviceId}`}, ":clientIdPrefix": {S: "client#"}},
            KeyConditionExpression: "#serviceId = :serviceId AND begins_with ( #clientId, :clientIdPrefix )"
        }
        console.log(params);
        const command = new QueryCommand(params);
        const items = await this.dynamodb.send(command);
        console.log(items);
        return items;
    }
}

export default DynamoClient;