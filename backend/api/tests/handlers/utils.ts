import {APIGatewayProxyEvent} from "aws-lambda";
import {Context} from "aws-lambda";

export const constructTestApiGatewayEvent = (params = {body: "", pathParameters: {}}): APIGatewayProxyEvent => ({
    httpMethod: "get",
    body: params.body,
    headers: {},
    isBase64Encoded: false,
    multiValueHeaders: {},
    multiValueQueryStringParameters: {},
    path: "/",
    pathParameters: params.pathParameters,
    queryStringParameters: {},
    requestContext: {
        accountId: "123456789012",
        apiId: "1234",
        authorizer: {
            claims: {
                client_id: undefined
            }
        },
        httpMethod: "get",
        identity: {
            accessKey: "",
            accountId: "",
            apiKey: "",
            apiKeyId: "",
            caller: "",
            clientCert: {
                clientCertPem: "",
                issuerDN: "",
                serialNumber: "",
                subjectDN: "",
                validity: {notAfter: "", notBefore: ""}
            },
            cognitoAuthenticationProvider: "",
            cognitoAuthenticationType: "",
            cognitoIdentityId: "",
            cognitoIdentityPoolId: "",
            principalOrgId: "",
            sourceIp: "",
            user: "",
            userAgent: "",
            userArn: ""
        },
        path: "/hello",
        protocol: "HTTP/1.1",
        requestId: "c6af9ac6-7b61-11e6-9a41-93e8deadbeef",
        requestTimeEpoch: 1428582896000,
        resourceId: "123456",
        resourcePath: "/hello",
        stage: "dev"
    },
    resource: "",
    stageVariables: {}
});

export const mockLambdaContext: Context = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: "someFunction",
    functionVersion: "someVersion",
    invokedFunctionArn: "someFunctionArn",
    memoryLimitInMB: "1",
    awsRequestId: "someRequestId",
    logGroupName: "someLogGroupName",
    logStreamName: "someLogStreamName",
    getRemainingTimeInMillis: () => 1,
    done: jest.fn(),
    fail: jest.fn(),
    succeed: jest.fn()
};
