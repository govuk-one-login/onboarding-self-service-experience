import {AdminGetUserCommandOutput, AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import User from "@self-service/client/user";
import bodyParser from "body-parser";
import express, {NextFunction, Request, Response} from "express";
import "express-async-errors";
import sessions from "express-session";
import configureViews from "./config/configure-views";
import {RedirectError, RenderError} from "./lib/errors";
import setSignedInStatus from "./middleware/setSignedInStatus";
import createAccount from "./routes/create-account-or-sign-in";
import manageAccount from "./routes/manage-account";
import signIn from "./routes/sign-in";
import testingRoutes from "./routes/testing-routes";
import SelfServiceServicesService from "./services/self-service-services-service";

const app = express();

const cognitoPromise = import(`./services/cognito/${process.env.COGNITO_CLIENT || "CognitoClient"}`).then(client => {
    const cognito = new client.default.CognitoClient();
    app.set("cognitoClient", cognito);
    return cognito;
});

const lambdaPromise = import(`./services/lambda/${process.env.LAMBDA_FACADE || "LambdaFacade"}`).then(facade => {
    const lambda = facade.lambdaFacadeInstance;
    app.set("lambdaFacade", facade.lambdaFacadeInstance);
    return lambda;
});

Promise.all([cognitoPromise, lambdaPromise]).then(deps => {
    app.set("backing-service", new SelfServiceServicesService(deps[0], deps[1]));
});

app.use("/dist", express.static("./dist/assets"));
app.use(express.static("./dist"));
app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

app.use(
    sessions({
        secret: "setting_this_will_never_cause_problems_in_future",
        saveUninitialized: true,
        cookie: {maxAge: 1_000 * 60 * 60 * 24},
        resave: false
    })
);

declare module "express-session" {
    interface SessionData {
        emailAddress: string;
        mobileNumber: string;
        enteredMobileNumber: string;
        cognitoSession: string;
        authenticationResult: AuthenticationResultType;
        cognitoUser: AdminGetUserCommandOutput;
        selfServiceUser: User;
        updatedField: string;
        isSignedIn: boolean;
    }
}

configureViews(app);

app.use(setSignedInStatus);

app.use("/", createAccount);
app.use("/", signIn);
app.use("/", manageAccount);
app.use("/", testingRoutes);

app.get("/", function (req: Request, res: Response) {
    res.render("index.njk", {active: "get-started"});
});

app.use((req: Request, res: Response, next: NextFunction) => {
    res.status(404).render("404.njk");
});

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof RenderError) {
        res.render(err.template, err.options);
    } else {
        next(err);
    }
});

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    if (err instanceof RedirectError) {
        res.redirect(err.route);
    } else {
        next(err);
    }
});

app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    res.render("there-is-a-problem.njk");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running; listening on port ${port}`));
