# Self-Service Experience

## Install SAM if it's not already installed

```shell
brew tap aws/tap
brew install aws-sam-cli
```

## Install the right version of Node

Make sure you have an appropriate version of node. 14 is the current LTS version and the one we use for our applications.

```shell
brew install nvm
# follow the instructions about adding some commands to your shell, creating ~/.zshrc or whatever your shell uses if necessary
. ~/.zshrc
nvm install 14.20.0
nvm use 14.20.0
# if it's not already the default
```

## Deploy stacks

Deploy your own stacks

```shell
cd backend/cognito
sam build
gds aws <your-aws-account> -- sam deploy --parameter-overrides "DomainOrEmailIdentityToVerify=development.sign-in.service.gov.uk SignInHostedZone=SignInServiceDevelopmentHostedZone"
# Go with the defaults except the stack name; choose something like your-name-cognito

cd ../dynamo-db
sam build
gds aws <your-aws-account> -- sam deploy --guided
# Go with the defaults except the stack name; choose something like your-name-ddb (remember what you used)

cd ../api
sam build
gds aws <your-aws-account> -- sam deploy --parameter-overrides "AuthRegistrationBaseUrl=https://oidc.integration.account.gov.uk DynamoDbTableStackName=<the-name-you-chose>" --guided
# Choose a decent stack name (name it after yourself for example) and accept the other defaults but tell it yes about lambdas that don't have authorisation

To install and run DynamoDB local for session storage.
Download and install Docker desktop - https://www.docker.com/products/docker-desktop/.
cd ./backend/dynamo-db/ docker-compose up - This will spin up the local dynamoDB.
```

## Configure and run the application

To experience the Self-Service Experience, copy, `.env.example`, rename it to `.env` and update the variables with appropriate values. These values will relate to the stacks you've just created.

`npm run build` the first time you need to run the application in order to build the stylesheets and assets. If you don't do this, the page will look like it's escaped from Netscape in the late 1990s.

There are two environment variables which can be set:

COGNITO_CLIENT=[ CognitoClient | StubCognitoClient ]
LAMBDA_FACADE=[ LambdaFacade | StubLambdaFacade ]

In general the application will use the full implementations if the environment variables have not been set to use the stubs. To use the full implementations you'll need AWS Credentials; these can be set using `gds aws <your-account> --`

`gds aws <account> -- npm run dev` if you want it to restart every time you change something. This sets the above environment variables to the stub values if they're not set explicitly (see [package.json](./express/package.json))

`gds aws <account> -- npm start` if you don't want the application to restart.
