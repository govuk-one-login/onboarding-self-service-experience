import {SFNClient, StartSyncExecutionCommand, SyncExecutionStatus} from "@aws-sdk/client-sfn";
import {APIGatewayProxyEvent, APIGatewayProxyResult} from "aws-lambda";
import * as process from "process";

const stepFunctionsClient = new SFNClient({region: "eu-west-2"});

export const stepFunctionHandler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
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
