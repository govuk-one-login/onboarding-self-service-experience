import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {stepFunctionHandler} from "./step-function-handler";

export const doUpdateServiceHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.info("In doUpdateServiceHandler() callback from step function. Context (" + JSON.stringify(context) + ")");
    return stepFunctionHandler(event);
};
