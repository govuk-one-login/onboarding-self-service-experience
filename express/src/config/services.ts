import {Express} from "express";
import {useStubApi} from "./environment.js";
import LambdaFacadeInterface from "../services/lambda-facade/LambdaFacadeInterface.js";
import CognitoInterface from "../services/cognito/CognitoInterface.js";
import StubCognitoClient from "../services/cognito/StubCognitoClient.js";
import StubLambdaFacade from "../services/lambda-facade/StubLambdaFacade.js";
import CognitoClient from "../services/cognito/CognitoClient.js";
import LambdaFacade from "../services/lambda-facade/LambdaFacade.js";
import SelfServiceServicesService from "../services/self-service-services-service.js";
import logger from "../lib/logger.js";

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
    logger.debug("Backing service created");
}
