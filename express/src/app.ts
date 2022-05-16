import express, {NextFunction, Request, Response} from 'express';
import configureViews from './lib/configureViews';
import createAccount from "./routes/create-account-or-sign-in";
import signIn from "./routes/sign-in";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import sessions from 'express-session';
import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import manageAccount from "./routes/manage-account";
import CognitoInterface from "./lib/cognito/CognitoInterface";
import(`./lib/cognito/${process.env.COGNITO_CLIENT||"CognitoClient"}`).then(
    client => {
        app.set('cognitoClient', new client.default.CognitoClient);
    }
);
import testingRoutes from "./routes/testing-routes";

const app = express();


app.use('/dist', express.static('./dist/assets'));
app.use(express.static('./dist'));
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(sessions({
    secret: "setting_this_will_never_cause_problems_in_future",
    saveUninitialized:true,
    cookie: { maxAge: 1_000 * 60 * 60 * 24 },
    resave: false
}));

declare module 'express-session' {
    interface SessionData {
        emailAddress: string;
        mobileNumber: string;
        session: string;
        authenticationResult: AuthenticationResultType
    }
}

configureViews(app);

app.use("/", createAccount);
app.use("/", signIn);
app.use("/", manageAccount);
app.use("/", testingRoutes);

app.get("/", function (req: Request, res: Response) {
    res.render("index.njk", {active: 'get-started'});
});

app.use(function (err: unknown, req: Request, res: Response, next: NextFunction) {
    // in async controller methods, you need to catch and next(error); to reach this.
    console.log("Error handler");
    res.send('This should be the something went wrong page');
});

const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running; listening on port ${port}`));


