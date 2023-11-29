import {
    AttributeValue,
    DynamoDBClient,
    GetItemCommand,
    GetItemCommandOutput,
    PutItemCommand,
    PutItemCommandOutput,
    QueryCommand,
    ScanCommand,
    DeleteItemCommand,
    QueryCommandOutput,
    ScanCommandOutput,
    ScanCommandInput,
    UpdateItemCommand,
    UpdateItemCommandInput,
    UpdateItemCommandOutput,
    DeleteItemInput,
    DeleteItemCommandInput
} from "@aws-sdk/client-dynamodb";
import {convertToAttr, marshall} from "@aws-sdk/util-dynamodb";
import * as process from "process";
import {OnboardingTableItem} from "./onboarding-table-item";
import {createHash} from "crypto";

type AttributeData = number | boolean | string | string[];
type AttributeNames = {[nameToken: string]: string};
type AttributeValues = {[valueToken: string]: AttributeValue};
type Updates = {[attributeName: string]: AttributeData};

export default class DynamoDbClient {
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

    async getUser(id: string): Promise<GetItemCommandOutput> {
        const params = {
            TableName: this.tableName,
            Key: marshall({pk: id, sk: id})
        };

        const command = new GetItemCommand(params);
        return this.dynamodb.send(command);
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

    async getSessions(userEmail: string): Promise<ScanCommandOutput> {
        const emailHash = this.createMd5Hash(userEmail);
        console.log(`dynamodb-client getSessions(), emailHash: ${emailHash}`);
        const params: ScanCommandInput = {
            TableName: this.tableName,
            ProjectionExpression: "id",
            ExpressionAttributeNames: {"#userEmail": "id"},
            ExpressionAttributeValues: {":userEmail": {S: `${emailHash}:`}},
            FilterExpression: "begins_with(#userEmail, :userEmail)"
        };

        const command = new ScanCommand(params);
        return this.dynamodb.send(command);
    }

    async deleteSessions(userEmail: string): Promise<{deletedItemCount: number}> {
        const activeSessions = (await this.getSessions(userEmail)).Items;

        if (!activeSessions || activeSessions.length == 0) return {deletedItemCount: 0};

        console.log(`Number of items to delete: ${activeSessions.length}`);

        let deletedItemsCount = 0;

        for (const activeSession of activeSessions) {
            const key = "" + activeSession.id.S;
            console.log(`Deleting item with key: ${key}`);
            const params: DeleteItemInput = {
                TableName: this.tableName,
                Key: {id: {S: key}}
            };
            const command = new DeleteItemCommand(params);
            const response = await this.dynamodb.send(command);
            console.log(`Deleted item with key: ${key}, HTTP Status code: ${response.$metadata.httpStatusCode}`);
            deletedItemsCount++;
        }

        console.log(`Number of deleted items: ${deletedItemsCount}`);

        return {deletedItemCount: deletedItemsCount};
    }

    async getServicesById(serviceId: string): Promise<QueryCommandOutput> {
        const params = {
            TableName: this.tableName,
            ExpressionAttributeNames: {"#serviceId": "pk"},
            ExpressionAttributeValues: {":serviceId": {S: `service#${serviceId}`}},
            KeyConditionExpression: "#serviceId = :serviceId"
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
        return this.update("user", userId, "user", userId, updates);
    }

    async updateService(serviceId: string, updates: Updates): Promise<{message: string}> {
        const startTime = Date.now();
        const dynamodbUpdates: Promise<UpdateItemCommandOutput>[] = [];
        await this.getServicesById(serviceId).then(output => {
            if (output.Items) {
                output.Items.forEach(row => {
                    dynamodbUpdates.push(this.updateByKey({pk: row.pk, sk: row.sk}, updates));
                });
            }
        });
        for (const dynamodbUpdate of dynamodbUpdates) {
            await dynamodbUpdate.catch(err => {
                throw new Error(err);
            });
        }
        console.log(`updateService() - Updated ${dynamodbUpdates.length} records in ${Date.now() - startTime} ms`);
        return new Promise(resolve => {
            resolve({message: "All records updated successfully"});
        });
    }

    async getListOfClients(): Promise<ScanCommandOutput> {
        console.log(`dynamodb-client - getListOfClients()`);

        const params: ScanCommandInput = {
            TableName: this.tableName,
            ProjectionExpression: "pk, sk, email, phone",
            ExpressionAttributeNames: {"#userTag": "pk"},
            ExpressionAttributeValues: {":userTag": {S: `user#`}},
            FilterExpression: "begins_with(#userTag, :userTag)"
        };

        const command = new ScanCommand(params);
        return await this.dynamodb.send(command);
    }

    async deleteDynamoDBClientEntries(userID: string, serviceID: string): Promise<void> {
        console.log("dynamodb-client - deleteDynamoDBClientEntries()");

        const targetServiceID = "service#" + serviceID;
        const targetUserID: string = "user#" + userID;

        // Delete Service Record for Client
        const deleteServiceRecordParams: DeleteItemCommandInput = {
            TableName: this.tableName,
            Key: {pk: {S: targetServiceID}, sk: {S: targetUserID}}
        };

        const deleteServiceRecordCommand = new DeleteItemCommand(deleteServiceRecordParams);
        await this.dynamodb.send(deleteServiceRecordCommand);

        // Delete Client Record for Service
        const deleteClientRecordParams: DeleteItemCommandInput = {
            TableName: this.tableName,
            Key: {pk: {S: targetUserID}, sk: {S: targetUserID}}
        };

        const deleteClientRecordCommand = new DeleteItemCommand(deleteClientRecordParams);
        await this.dynamodb.send(deleteClientRecordCommand);
    }

    private async update(pkPrefix: string, pk: string, skPrefix: string, sk: string, updates: Updates): Promise<UpdateItemCommandOutput> {
        const attributeNames = Object.keys(updates);

        const params: UpdateItemCommandInput = {
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

    private async updateByKey(Key: Record<string, AttributeValue>, updates: Updates): Promise<UpdateItemCommandOutput> {
        const attributeNames = Object.keys(updates);

        const params: UpdateItemCommandInput = {
            TableName: this.tableName,
            Key,
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
        return Object.fromEntries(attributes.map(attribute => [this.getAttributeValueLabel(attribute), convertToAttr(updates[attribute])]));
    }

    private getAttributeNameAlias(attributeName: string) {
        return DynamoDbClient.KEYWORD_SUBSTITUTES[attributeName] ?? `#${attributeName}`;
    }

    private getAttributeValueLabel(attributeName: string) {
        return `:${attributeName}`;
    }

    private createMd5Hash(text: string) {
        const hash = createHash("md5")
            .update(!!text ? text : "")
            .digest("hex");
        return hash;
    }
}
