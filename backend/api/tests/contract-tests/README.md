# PACT Contract Testing for SSE Admin Tool

A framework using Pact-js to validate contract testing between consumer and provider APIs in the SSE Admin Tool.

Tests are provided for the Client Registry API. At this time that API has no Provider tests, therefore the existing test is mocked.

## Environment settings

-   export PACT_DO_NOT_TRACK=true
-   export PUBLISH_PACT=true
-   export PACT_BROKER_BASE_URL=<PACT_BROKER_URL here>
-   export PACT_BROKER_USERNAME=<PACT_BROKER_USERNAME here>
-   export PACT_BROKER_PASSWORD=<PACT_BROKER_PASSWORD here>

## Running the consumer tests

-   Build the code: `npm run build`

## Running the consumer tests

-   Publish the contract to your pact broker: `npm run publish`
-   Verify the PACT: `npm run verify`
-   Run the consumer tests: `npm run test`

The first two stages must be run manually whenever a contract changes. The final stage will run automatically during a build.
