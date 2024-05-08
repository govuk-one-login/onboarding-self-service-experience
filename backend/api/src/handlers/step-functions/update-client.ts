import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {stepFunctionHandler} from "./step-function-handler";

export const doUpdateClientHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.info("In doUpdateClientHandler() callback from step function. Context (" + JSON.stringify(context) + ")");
    return stepFunctionHandler(event);
};
