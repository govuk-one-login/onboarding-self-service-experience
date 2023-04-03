import {DynamoDB} from "@aws-sdk/client-dynamodb";
import connect_dynamodb from "connect-dynamodb";
import {RequestHandler} from "express";
import session from "express-session";

export default getSessionStorage();

function getSessionStorage(): RequestHandler {
    if (process.env.SESSION_STORAGE === "DynamoDB") {
        const table = process.env.SESSIONS_TABLE;
        const endpoint = process.env.DYNAMO_DB_ENDPOINT;
        const region = process.env.AWS_REGION || "eu-west-2";
        const client = new DynamoDB({region: region, endpoint: endpoint});
        console.log(`Using dynamoDB session storage | Table: ${table} | Endpoint: ${endpoint || "AWS"}`);

        const options = {
            table: table,
            client: client,
            AWSRegion: region
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
