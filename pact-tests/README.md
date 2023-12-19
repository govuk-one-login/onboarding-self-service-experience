# PACT Contract Testing for SSE Admin Tool

A framework using Pact-js to validate contract testing between consumer and provider APIs in the SSE Admin Tool.

NOTE: PACT tests should not be run in the build pipeline at this time.

## Environment settings

-   export PACT_DO_NOT_TRACK=true
-   export PUBLISH_PACT=true
-   export PACT_BROKER_URL=<PACT_BROKER_URL here>
-   export PACT_API_TOKEN=<API_TOKEN here>

## Running the consumer tests

-   Build the code: `npm run build`

## Running the consumer tests

-   Publish the contract to your pact broker: `npm run publish`
-   Verify the PACT: `npm run verify`
-   Run the consumer tests: `npm run test`
