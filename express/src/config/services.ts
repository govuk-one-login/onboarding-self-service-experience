import {Express} from "express";
import {useStubApi} from "./environment";
import LambdaFacadeInterface from "../services/lambda-facade/LambdaFacadeInterface";
import CognitoInterface from "../services/cognito/CognitoInterface";
import StubCognitoClient from "../services/cognito/StubCognitoClient";
import StubLambdaFacade from "../services/lambda-facade/StubLambdaFacade";
import CognitoClient from "../services/cognito/CognitoClient";
import LambdaFacade from "../services/lambda-facade/LambdaFacade";
import SelfServiceServicesService from "../services/self-service-services-service";

export default function configureServices(app: Express) {
    let cognito: CognitoInterface;
    let api: LambdaFacadeInterface;

    if (useStubApi) {
        cognito = new StubCognitoClient();
        api = new StubLambdaFacade();
    } else {
        cognito = new CognitoClient();
        api = new LambdaFacade();
    }

    app.set("backing-service", new SelfServiceServicesService(cognito, api));
    console.log("Backing service created");
}
