import {
    AttributeValue,
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandOutput,
    QueryCommand,
    QueryCommandOutput,
    UpdateItemCommand,
    UpdateItemCommandOutput
} from "@aws-sdk/client-dynamodb";
import {marshall} from "@aws-sdk/util-dynamodb";
import * as process from "process";
import {OnboardingTableItem} from "../@Types/OnboardingTableItem";

type AttributeNames = {[nameToken: string]: string};
type AttributeValues = {[valueToken: string]: AttributeValue};
type Updates = {[attribute: string]: number | boolean | string | string[]};

class DynamoClient {
    private static readonly KEYWORD_SUBSTITUTES: {[name: string]: string} = {
        data: "#D"
    };

    private readonly tableName: string;
    private readonly dynamodb: DynamoDBClient;

    constructor() {
        if (process.env.TABLE == undefined) {
            throw new Error("Table name is not provided in the environment");
        }

        this.tableName = process.env.TABLE;
        this.dynamodb = new DynamoDBClient({region: process.env.AWS_REGION});
    }

    async put(item: OnboardingTableItem): Promise<PutItemCommandOutput> {
        const params = {
            TableName: this.tableName,
            Item: marshall(item)
        };

        const command = new PutItemCommand(params);
        return this.dynamodb.send(command);
    }

    async queryBySortKey(sortKey: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            IndexName: "gsi1",
            ExpressionAttributeValues: {":sortKey": {S: sortKey}},
            KeyConditionExpression: "sk = :sortKey"
        };

        const command = new QueryCommand(params);
        return this.dynamodb.send(command);
    }

    async getServices(userId: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            IndexName: "gsi1",
            ExpressionAttributeNames: {"#userId": "sk", "#serviceId": "pk"},
            ExpressionAttributeValues: {":userId": {S: `user#${userId}`}, ":serviceIdPrefix": {S: "service#"}},
            KeyConditionExpression: "#userId = :userId AND begins_with ( #serviceId, :serviceIdPrefix )"
        };

        const command = new QueryCommand(params);
        return this.dynamodb.send(command);
    }

    async getClients(serviceId: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            ExpressionAttributeNames: {"#serviceId": "pk", "#clientId": "sk"},
            ExpressionAttributeValues: {":serviceId": {S: `service#${serviceId}`}, ":clientIdPrefix": {S: "client#"}},
            KeyConditionExpression: "#serviceId = :serviceId AND begins_with ( #clientId, :clientIdPrefix )"
        };

        const command = new QueryCommand(params);
        return this.dynamodb.send(command);
    }

    async updateClient(serviceId: string, clientId: string, updates: Updates): Promise<UpdateItemCommandOutput> {
        return this.update("service", serviceId, "client", clientId, updates);
    }

    async updateUser(userId: string, cognitoUserId: string, updates: Updates): Promise<UpdateItemCommandOutput> {
        return this.update("user", userId, "cognito_username", cognitoUserId, updates);
    }

    private async update(pkPrefix: string, pk: string, skPrefix: string, sk: string, updates: Updates): Promise<UpdateItemCommandOutput> {
        const attributeNames = Object.keys(updates);

        const params = {
            TableName: this.tableName,
            Key: {
                pk: {S: `${pkPrefix}#${pk}`},
                sk: {S: `${skPrefix}#${sk}`}
            },
            UpdateExpression: this.generateUpdateExpression(attributeNames),
            ExpressionAttributeNames: this.generateExpressionAttributeNames(attributeNames),
            ExpressionAttributeValues: this.generateExpressionAttributeValues(attributeNames, updates),
            ReturnValues: "ALL_NEW"
        };

        const command = new UpdateItemCommand(params);
        return this.dynamodb.send(command);
    }

    // TODO: Make methods below private whilst making testing work
    generateUpdateExpression(attributes: string[]): string {
        return attributes
            .map(attribute => `set ${this.getAttributeNameAlias(attribute)} = ${this.getAttributeValueLabel(attribute)}`)
            .join(", ");
    }

    generateExpressionAttributeNames(attributes: string[]): AttributeNames {
        return Object.fromEntries(attributes.map(attribute => [this.getAttributeNameAlias(attribute), attribute]));
    }

    generateExpressionAttributeValues(attributes: string[], updates: Updates): AttributeValues {
        return Object.fromEntries(
            attributes.map(attribute => [this.getAttributeValueLabel(attribute), this.marshallAttribute(updates[attribute])])
        );
    }

    private getAttributeNameAlias(attributeName: string) {
        return DynamoClient.KEYWORD_SUBSTITUTES[attributeName] || `#${attributeName}`;
    }

    private getAttributeValueLabel(attributeName: string) {
        return `:${attributeName}`;
    }

    private marshallAttribute(attribute: any): any {
        if (Array.isArray(attribute)) {
            return {L: marshall(attribute)};
        } else {
            return marshall(attribute);
        }
    }
}

export default DynamoClient;
