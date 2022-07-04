import {
    DynamoDBClient,
    PutItemCommand,
    PutItemCommandOutput,
    GetItemCommand,
    GetItemCommandOutput,
    QueryCommand,
    QueryCommandOutput,
    UpdateItemCommand,
    UpdateItemCommandOutput,
    AttributeValue
} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {OnboardingTableItem} from "../@Types/OnboardingTableItem";
import * as process from "process";

class DynamoClient {
    private dynamodb: DynamoDBClient;
    private readonly tableName: string;

    constructor(tableName: string) {
        this.dynamodb = new DynamoDBClient({region: process.env.AWS_REGION});
        this.tableName = tableName;
    }

    async put(item: OnboardingTableItem): Promise<PutItemCommandOutput> {
        const params = {
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
        const command = new QueryCommand(params);
        const items = await this.dynamodb.send(command);
        return items;
    }

    async updateClient(serviceId: string, clientId: string, updates: object): Promise<UpdateItemCommandOutput> {

        const attributes = Object.keys(updates);
        const attributeNames = this.generateExpressionAttributeNames(attributes);

        const params =
            {
                TableName: process.env.TABLE as string,
                Key: {
                    pk: {
                        S: `service#${serviceId}`
                    },
                    sk: {
                        S: `client#${clientId}`
                    }
                },
                UpdateExpression: this.generateUpdateExpression(attributeNames),
                ExpressionAttributeNames: attributeNames,
                ExpressionAttributeValues: this.generateExpressionAttributeValues(attributes, updates),
                ReturnValues: "ALL_NEW"
            };

        const command = new UpdateItemCommand(params);
        return await this.dynamodb.send(command);
    }

    generateUpdateExpression(attributeNames: { [key: string]: string; }): string {
        let expression = "";
        let i = 0;
        let keys = Object.keys(attributeNames);
        for (let i = 0; i < keys.length; i++) {
            expression += ` set ${keys[i]} = :val${i},`;
        }
        return expression.slice(1, -1);
    }

    generateExpressionAttributeValues(attributes: string[], update: object): { [key: string]: AttributeValue; } {
        let values: any = {};
        for (let i = 0; i < attributes.length; i++) {
            const val = update[attributes[i] as keyof typeof update];
            values[`:val${i}`] = this.customMarshal(val);
        }
        return values;
    }

    generateExpressionAttributeNames(attributes: string[]): { [key: string]: string; } {
        let attributeNames: any = {};
        for (let i = 0; i < attributes.length; i++) {
            if (attributes[i] in this.keyWordSubstitutes) {
                attributeNames[`${this.keyWordSubstitutes[attributes[i]]}` as keyof typeof attributeNames] = attributes[i];
            } else {
                attributeNames[`#${attributes[i]}`] = attributes[i];
            }
        }
        return attributeNames;
    }

    private keyWordSubstitutes: { [key: string]: string; } = {
        data: "#d"
    }

    private customMarshal(attribute: any) {
        if (Array.isArray(attribute)) {
            return this.customMarshalBecauseAwsUtilsIsBroken(attribute)
        } else {
            return marshall(attribute);
        }
    }

    private customMarshalBecauseAwsUtilsIsBroken(array: string[]) {
        let value: any = {};
        let list = [];
        for (let i = 0; i < array.length; i++) {
            list.push(marshall(array[i]));
        }
        value["L"] = list;
        return value;
    }
}

export default DynamoClient;