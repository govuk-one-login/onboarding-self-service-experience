import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {stepFunctionHandler} from "./step-function-handler";

export const newClientHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.info("In newClientHandler() callback from step function. Context (" + JSON.stringify(context) + ")");
    return stepFunctionHandler(event);
};
