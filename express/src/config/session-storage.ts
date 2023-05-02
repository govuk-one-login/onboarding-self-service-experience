import {DynamoDB} from "@aws-sdk/client-dynamodb";
import connect_dynamodb from "connect-dynamodb";
import {RequestHandler} from "express";
import session from "express-session";
import {awsRegion, sessionStorage} from "./environment";

export default getSessionStorage();

function getSessionStorage(): RequestHandler {
    if (sessionStorage.store === "DynamoDB") {
        const table = sessionStorage.tableName;
        const endpoint = sessionStorage.dynamoDbEndpoint;
        const client = new DynamoDB({region: awsRegion, endpoint: endpoint});
        console.log(`Using dynamoDB session storage | Table: ${table} | Endpoint: ${endpoint ?? "AWS"}`);

        const options = {
            table: table,
            client: client,
            AWSRegion: awsRegion
        };

        const DynamoDBStore = connect_dynamodb({session: session});
        return session({
            store: new DynamoDBStore(options),
            secret: "keyboard cat",
            cookie: {maxAge: 1000 * 60 * 60}
        });
    } else {
        console.log("Using in-memory session storage");
        return session({
            secret: "setting_this_will_never_cause_problems_in_future",
            saveUninitialized: true,
            cookie: {maxAge: 1_000 * 60 * 60 * 24},
            resave: false
        });
    }
}
