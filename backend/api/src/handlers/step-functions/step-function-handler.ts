import {SFNClient, StartSyncExecutionCommand, SyncExecutionStatus} from "@aws-sdk/client-sfn";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import * as process from "process";
import {Logger} from "@aws-lambda-powertools/logger";

export const logger = new Logger({
    serviceName: "self-service-experience"
});

const stepFunctionsClient = new SFNClient({region: "eu-west-2"});

export const stepFunctionHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    logger.addContext(context);
    logger.info("Starting step function.");

    const payload = event?.body ? JSON.parse(event.body as string) : event;
    const stateMachineArn = process.env.STATE_MACHINE_ARN as string;
    const input = JSON.stringify(payload);
    const params = {
        stateMachineArn,
        input
    };

    const invokeCommand = new StartSyncExecutionCommand(params);
    const result = await stepFunctionsClient.send(invokeCommand);

    let statusCode = 200;
    let resultBody: string;
    if (result.status == SyncExecutionStatus.SUCCEEDED) {
        resultBody = JSON.stringify(result);
    } else if (result.status == SyncExecutionStatus.TIMED_OUT) {
        statusCode = 408;
        resultBody = "Function timed out";
        logger.error(resultBody);
    } else {
        statusCode = 400;
        resultBody = "Function returned error: " + result.error + ", cause: " + result.cause;
        logger.error(resultBody);
    }

    return {statusCode: statusCode, body: resultBody};
};
