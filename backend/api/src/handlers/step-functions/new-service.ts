import {SFNClient, StartSyncExecutionCommand} from "@aws-sdk/client-sfn";
import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import * as process from "process";

const stepFunctionsClient = new SFNClient({region: "eu-west-2"});

export const newServiceHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const payload = event?.body ? JSON.parse(event.body as string) : event;
    const stateMachineArn = process.env.STATE_MACHINE_ARN as string;
    const input = JSON.stringify(payload);
    const params = {
        stateMachineArn,
        input
    };

    const invokeCommand = new StartSyncExecutionCommand(params);
    const result = await stepFunctionsClient.send(invokeCommand);
    return {statusCode: 200, body: JSON.stringify(result)};
};
