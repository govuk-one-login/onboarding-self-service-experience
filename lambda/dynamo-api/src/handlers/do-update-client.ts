import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from 'aws-lambda';
import * as process from "process";
import {
    SFNClient,
    StartSyncExecutionCommand,
    StartSyncExecutionCommandInput,
    StartSyncExecutionCommandOutput
} from '@aws-sdk/client-sfn'

const stepFunctionsClient = new SFNClient({region: 'eu-west-2'});

export const doUpdateClientHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    const payload = event?.body ? JSON.parse(event.body as string) : event;
    console.debug(payload)
    const stateMachineArn = process.env.STATE_MACHINE_ARN as string;
    console.debug(stateMachineArn)
    const input = JSON.stringify(payload);
    const params = {
        stateMachineArn,
        input
    }
    const invokeCommand = new StartSyncExecutionCommand(params);
    const result = await stepFunctionsClient.send(invokeCommand);
    let response = {statusCode: 200, body: JSON.stringify(result)};

    return response;
};