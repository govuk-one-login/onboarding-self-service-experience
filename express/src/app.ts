import {AuthenticationResultType} from "@aws-sdk/client-cognito-identity-provider";
import bodyParser from "body-parser";
import express, {NextFunction, Request, Response} from "express";
import "express-async-errors";
import configureViews from "./config/configure-views";
import {distribution} from "./config/resources";
import setSignedInStatus from "./middleware/setSignedInStatus";
import createAccount from "./routes/register";
import manageAccount from "./routes/manage-account";
import signIn from "./routes/sign-in";
import testingRoutes from "./routes/testing-routes";
import {sessionStorage} from "./lib/dynamodb/sessionStorage";
import SelfServiceServicesService, {MfaResponse} from "./services/self-service-services-service";

const app = express();

app.use(sessionStorage());

const cognitoPromise = import(`./services/cognito/${process.env.COGNITO_CLIENT || "CognitoClient"}`).then(client => {
    const cognito = new client.default.CognitoClient();
    app.set("cognitoClient", cognito);
    return cognito;
});

const lambdaPromise = import(`./services/lambda-facade/${process.env.LAMBDA_FACADE || "LambdaFacade"}`).then(facade => {
    const lambda = facade.lambdaFacadeInstance;
    app.set("lambdaFacade", facade.lambdaFacadeInstance);
    return lambda;
});

Promise.all([cognitoPromise, lambdaPromise]).then(deps => {
    app.set("backing-service", new SelfServiceServicesService(deps[0], deps[1]));
    console.log("Backing service created");
});

app.use("/assets", express.static(distribution.assets));
app.use("/assets/images", express.static(distribution.images));

app.use(
    bodyParser.urlencoded({
        extended: true
    })
);

declare module "express-session" {
    interface SessionData {
        emailAddress: string;
        mobileNumber: string;
        cognitoSession: string;
        isSignedIn: boolean;
        authenticationResult: AuthenticationResultType;
        enteredMobileNumber: string;
        mfaResponse: MfaResponse;
        updatedField: string;
        serviceName: string;
    }
}

configureViews(app);

app.use(setSignedInStatus);

app.use("/", createAccount);
app.use("/", signIn);
app.use("/", manageAccount);
app.use("/", testingRoutes);

app.get("/", function (req: Request, res: Response) {
    res.render("index.njk", {headerActiveItem: "get-started"});
});

app.locals.googleTagId = process.env.GOOGLE_TAG_ID;

app.use((req: Request, res: Response) => {
    res.status(404).render("404.njk");
    return;
});

// eslint-disable-next-line @typescript-eslint/no-unused-vars -- Error handling middleware must take 4 arguments
app.use(function (err: Error, req: Request, res: Response, next: NextFunction) {
    console.error(err);
    res.render("there-is-a-problem.njk");
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`Server running; listening on port ${port}`));
