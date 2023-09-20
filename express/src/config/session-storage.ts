import connect from "connect-dynamodb";
import e, {RequestHandler} from "express";
import session, {SessionData} from "express-session";
import {region, sessionSecret, sessionStorage} from "./environment";
import {DynamoDB} from "@aws-sdk/client-dynamodb";
import {randomUUID} from "crypto";
import {createMd5Hash} from "../controllers/utils";

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
            genid: (req: e.Request): string => {
                return createMd5Hash(req.body.emailAddress) + ":" + randomUUID();
            },
            store: new DynamoDBStore({
                table: sessionStorage.tableName,
                client: new DynamoDB({region: region}),
                prefix: ""
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
