# Self-Service Experience

## Install SAM if it's not already installed

```shell
brew tap aws/tap
brew install aws-sam-cli
```

## Install the right version of Node

Make sure you have an appropriate version of node. At the time of writing our lambdas use 18 which is the latest version provided by AWS but you can use the most recent versions of node.

```shell
brew install nvm
# follow the instructions about adding some commands to your shell, creating ~/.zshrc or whatever your shell uses if necessary
. ~/.zshrc
nvm install 18
nvm use 18
# if it's not already the default
```

Other ways to install node are available. `nodenv` for example.

## Deploy dev stacks

### Run a single script

Run `infrastructure/ci/development-stacks/deploy-development-stack.sh` with your chosen prefix (your name is probably a sensible choice, whatever you choose - don't end it with a `-`). The script needs you to provide AWS creds for the `di-onboarding-development` account.

```bash
development-stacks/ % gds aws di-onboarding-development -- deploy-development-stack.sh john-is-awesome
```

This will create the stacks you need and create a config file in `express` which you should rename to `.env`

```bash
express/ % mv .env.john-is-awesome .env
```

You can now start your front end. Again you'll need AWS creds for the `di-onboarding-development` account.

```bash
express/ % COGNITO_CLIENT=CognitoClient LAMBDA_FACADE=LambdaFacade gds aws di-onboarding-development -- npm run dev
```

Then go to http://localhost:3000 and create an account. Your creds will expire eventually and you'll need to restart express. You'll see something about an expired token in the console when that happens.

### Or

Deploy your own stacks to the AWS development account

Use the [SAM deployment script](infrastructure/deploy-sam-stack.sh) in the repo to deploy personal stacks, so they get tagged with the required metadata.

```shell
cd backend/cognito
sam build
gds aws <your-aws-account> -- sam deploy --parameter-overrides "DomainOrEmailIdentityToVerify=development.sign-in.service.gov.uk SignInHostedZone=SignInServiceDevelopmentHostedZone"
# Go with the defaults except the stack name; choose something like your-name-cognito

cd ../dynamo-db
sam build
gds aws <your-aws-account> -- sam deploy --guided
# Go with the defaults except the stack name; choose something like your-name-ddb (remember what you used)

# To install and run DynamoDB local for session storage.
# Download and install Docker desktop - https://www.docker.com/products/docker-desktop/.
cd ./backend/dynamo-db/ docker-compose up - This will spin up the local dynamoDB.
```

**API**

Choose a decent stack name (name it after yourself for example) and accept the other defaults but tell it yes about lambdas that don't have authorisation.

```shell
gds aws di-onboarding-development -- npm run deploy-api -- --parameter-overrides "DynamoDbTableStackName=<the-name-you-chose>" --guided
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

## URL Patterns

All URLs related to account section start with `account-` prefix.

Show a list of things
/things
e.g. /services (and not /list-services)

Show details about a thing
/things/:thingId
e.g. /services/123456

List objects belonging to a thing
/things/:thingId/objects
e.g. /services/123456/clients

Show details about a child thing belonging to a parent thing
/parents/:parentId/children/:childId
e.g. /services/123456/clients/456789
