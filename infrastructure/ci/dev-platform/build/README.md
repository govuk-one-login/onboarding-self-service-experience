# Things that we shouldn't need to do twice

## Supporting stacks for build account

Follow instructions on the [DI Dev Platform Confluence](https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/3376709648/Templates+to+only+apply+in+the+BUILD+account.).

Or run `./create-github-provider.sh`, `./create-aws-signer.sh` and `./create-container-signer.sh`

The scripts should run the latest version of the template as they invoke it from an S3Bucket.

You can get the values needed for the GHA Secrets from running `./secrets-for-gha.sh`

## Build stack

This has been clicked into life as per the dev team docs. The template and parameters can be found through
the web console and the stack can be updated with \_Stack actions > Create change set for current stack
