import {SFNClient, StartSyncExecutionCommand, SyncExecutionStatus} from "@aws-sdk/client-sfn";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import * as process from "process";

const stepFunctionsClient = new SFNClient({region: "eu-west-2"});

export const newClientHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.info("In newClientHandler() callback from step function. Event(" + event + ") Context (" + context + ")");
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
        console.error(resultBody);
    } else {
        statusCode = 400;
        resultBody = "Function returned error: " + result.error + ", cause: " + result.cause;
        console.error(resultBody);
    }

    return {statusCode: statusCode, body: resultBody};
};
