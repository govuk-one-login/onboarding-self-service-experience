import connect from "connect-dynamodb";
import {RequestHandler} from "express";
import session, {SessionData} from "express-session";
import {region, sessionSecret, sessionStorage} from "./environment";
import {DynamoDB} from "@aws-sdk/client-dynamodb";

export default getSessionStorage();

function getSessionStorage(): RequestHandler {
    if (sessionStorage.tableName) {
        console.log("Using DynamoDB session storage");
        const DynamoDBStore = connect<SessionData>(session);
        return session({
            secret: nonNull(sessionSecret),
            cookie: {maxAge: 1000 * 60 * 60},
            resave: false,
            saveUninitialized: false,
            store: new DynamoDBStore({
                table: sessionStorage.tableName,
                client: new DynamoDB({region: region})
            })
        });
    }

    console.log("Using in-memory session storage");
    return session({
        secret: "setting_this_will_never_cause_problems_in_future",
        cookie: {maxAge: 1_000 * 60 * 60 * 24},
        saveUninitialized: true,
        resave: false
    });
}
