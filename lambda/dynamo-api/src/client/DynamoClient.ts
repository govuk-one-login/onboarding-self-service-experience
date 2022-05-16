import {DynamoDBClient, PutItemCommand, PutItemCommandOutput} from "@aws-sdk/client-dynamodb";
import {marshall, unmarshall} from "@aws-sdk/util-dynamodb";
import {OnboardingTableItem} from "../@Types/OnboardingTableItem";

class DynamoClient {
    private dynamodb: DynamoDBClient;
    private readonly tableName: string;

    constructor(tableName: string) {
        this.dynamodb = new DynamoDBClient({ region: "eu-west-2" });
        this.tableName = tableName;
    }

    async put(item: OnboardingTableItem): Promise<PutItemCommandOutput> {
        console.log("About to try to marshal item");
        console.log("Item is:");
        console.log(item);
        const params  = {
            TableName : this.tableName,
            Item: marshall(item)
        };
        console.log("Item marshalled, creating command")
        const command = new PutItemCommand(params);
        console.log("Sending command")
        return await this.dynamodb.send(command);
    }

    //async getByKey
}

export default DynamoClient;