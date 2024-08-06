# Acceptance tests

These end-to-end tests are separated into acceptance and accessibility feature sets.

### Test Container

The acceptance tests are run from a test image see `tests.Dockerfile`. This image requires the following parameters to be passed to it can be run (these are passed automatically in CI pipelines):

| Variable         | Description                                                                                           |
| ---------------- | ----------------------------------------------------------------------------------------------------- |
| CFN_AdminToolURL | The fully qualified URL endpoint for tests to run against.                                            |
| TEST_ENVIRONMENT | Should be one of 'local' for developer and preview builds, or 'development' or 'build' for CI builds. |

See the guide on [build environments](https://govukverify.atlassian.net/wiki/spaces/DFA/pages/3962929695/Build+and+Deployment+processes) for more information.

### Stubbing

The tests are designed to run across the full Self-Service application including all of the backing services.

Variables exist to allow some of these backing services to be stubbed out:

| Variable     | Default | Description                                                                                               |
| ------------ | ------- | --------------------------------------------------------------------------------------------------------- |
| STUB_API     | False   | Runs the frontend service along, stubbing out all backend services including the private API and cognito. |
| USE_STUB_OTP | True    | Stubs the OTP validation for cognito, allowing bypassing mulit-factor requirements for test users.        |

## Running tests in CI

The acceptance end-to-end tests are run as part of the [secure pipelines test phase](https://govukverify.atlassian.net/wiki/x/IoAItg) in development and build environments.

The accessibility tests are run manually as required.

**Note:** The test endpoints have restricted access and tests can only be run from the same AWS VPC that the endpoint is deployed into.

## Running tests locally

Tests can be run against endpoints other than development and build by running locally whilst connected to the GDS VPN.

### Prerequisites

-   docker `v24.0.0`

### Run

To run the tests locally, the endpoint variables must be set, the test image must be built, and then the container can be run...

```
docker run -t \
  -e TEST_ENVIRONMENT='development' \
  -e CFN_AdminToolURL='https://admin.development.sign-in.service.gov.uk' \
  $(docker build --rm -f tests.Dockerfile --platform linux/amd64 -q .) /run-tests.sh
```
