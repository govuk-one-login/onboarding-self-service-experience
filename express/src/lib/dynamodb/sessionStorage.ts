import AWS from "aws-sdk";
import connect_dynamodb from "connect-dynamodb";
import session from "express-session";
import express from "express";

export function sessionStorage(): express.RequestHandler {
    const client = getClient();
    if (process.env.SESSION_STORAGE === "DynamoDB") {
        const options = {
            table: process.env.SESSIONS_TABLE,
            AWSRegion: "eu-west-2",
            client: client
        };

        const DynamoDBStore = connect_dynamodb({session: session});
        console.log(
            `Using dynamoDB session storage : Table: ${process.env.SESSIONS_TABLE} Endpoint: ${JSON.stringify(client?.endpoint.href)}`
        );
        return session({store: new DynamoDBStore(options), secret: "keyboard cat", cookie: {maxAge: 1000 * 60 * 60}});
    } else {
        console.log("Using in memory session storage");
        return session({
            secret: "setting_this_will_never_cause_problems_in_future",
            saveUninitialized: true,
            cookie: {maxAge: 1_000 * 60 * 60 * 24},
            resave: false
        });
    }
}

function getClient(): AWS.DynamoDB {
    return process.env.DYNAMO_DB_ENDPOINT
        ? new AWS.DynamoDB({endpoint: new AWS.Endpoint(process.env.DYNAMO_DB_ENDPOINT)})
        : new AWS.DynamoDB({region: "eu-west-2"});
}
