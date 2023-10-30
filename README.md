# Self-Service Experience

The Admin Tool is a self-service product that allows government service teams to onboard and test their integration
with the GOV.UK One Login service. 

See the [product page](https://sign-in.service.gov.uk/) for details and features, and
the [technical documentation](https://docs.sign-in.service.gov.uk/) for
onboarding instructions.

## Developer tools

Install SAM if it's not already installed.

```shell
brew tap aws/tap
brew install aws-sam-cli
```

Install and use the latest version of bash

```shell
brew install bash
```

Install JQ

```shell
brew install jq
```

**Install the right version of Node**

Make sure you have an appropriate version of Node. At the time of writing our Lambdas use 18, which is the latest
version
provided by AWS, but you can use the most recent version.

You may use a Node version manager, such as `nodenv` or `nvm`, to install Node.

## Deploy developer stacks

See [instructions](infrastructure/dev/README.md) to deploy dev stacks and run a local frontend against the deployed
backend.

### Configure and run the application

To experience the Self-Service Experience, copy, `.env.example`, rename it to `.env` and update the variables with
appropriate values. These values will relate to the stacks you've just created.

`npm run build` the first time you need to run the application in order to build the stylesheets and assets. If you
don't do this, the page will look like it's escaped from Netscape in the late 1990s.

In general the application will use the full implementations if the environment variables have not been set to use the
stubs (by setting the environment variable `STUB_API` to `true`). To use the full implementations you'll need AWS
Credentials; these can be set using `gds aws <your-account> --`

`gds aws <account> -- npm run dev` if you want it to restart every time you change something. This sets the above
environment variables to the stub values if they're not set explicitly (see [package.json](./express/package.json))

`gds aws <account> -- npm start` if you don't want the application to restart.

## URL Patterns

**Show a list of things**

`/things`

e.g. `/services` (and not /list-services)

**Show details about a thing**

`/things/:thingId`

e.g. `/services/123456`

**List objects belonging to a thing**

`/things/:thingId/objects`

e.g. `/services/123456/clients`

**Show details about a child thing belonging to a parent thing**

`/parents/:parentId/children/:childId`

e.g. `/services/123456/clients/456789`
