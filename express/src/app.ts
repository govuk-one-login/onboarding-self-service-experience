import express, {NextFunction, Request, Response} from 'express';
import configureViews from './lib/configureViews';
import createAccount from "./routes/create-account-or-sign-in";
import signIn from "./routes/sign-in";
import bodyParser from 'body-parser';
import cookieParser from 'cookie-parser';
import sessions from 'express-session';
import {CognitoClient} from "./lib/cognito";
import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import manageAccount from "./routes/manage-account";

const app = express();
app.set('cognitoClient', new CognitoClient());
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

app.get("/", function (req: Request, res: Response) {
    res.render("index.njk", {active: 'get-started'});
});

////// Testing routes - begin //////

//Testing route for service name get request
app.get("/add-service-name", function (req: Request, res: Response) {
    res.render("add-service-name.njk");
});

// Testing route for service name  get request with error
app.get("/add-service-name-error", function (req: Request, res: Response) {
    let errorMessages: Map<String, String> = new Map<String, String>();
    let errorUrls: Map<String, String> = new Map<String, String>();
    errorMessages.set('serviceName', 'Enter your service name');
    res.render("add-service-name.njk",{ errors: errorMessages });
});

// Testing route for client details dashboard
app.get("/service-dashboard-client-details", function (req: Request, res: Response) {
    res.render("service-dashboard-client-details.njk");
});


////// Testing routes - end //////



const port = process.env.PORT || 3000
app.listen(port, () => console.log(`Server running; listening on port ${port}`));
