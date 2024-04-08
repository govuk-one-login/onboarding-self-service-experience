import {APIGatewayProxyEvent, APIGatewayProxyResult, Context} from "aws-lambda";
import {stepFunctionHandler} from "./step-function-handler";

export const newServiceHandler = async (event: APIGatewayProxyEvent, context: Context): Promise<APIGatewayProxyResult> => {
    console.info("In newServiceHandler() callback from step function. Context (" + JSON.stringify(context) + ")");
    return stepFunctionHandler(event);
};
