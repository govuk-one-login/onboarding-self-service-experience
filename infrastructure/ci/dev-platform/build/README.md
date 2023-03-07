# Things that we shouldn't need to do twice

## Supporting stacks for build account

Follow instructions on the [DI Dev Platform Confluence](https://govukverify.atlassian.net/wiki/spaces/PLAT/pages/3376709648/Templates+to+only+apply+in+the+BUILD+account.).

Or run `./create-github-provider.sh`, `./create-aws-signer.sh` and `./create-container-signer.sh`

The scripts should run the latest version of the template as they invoke it from an S3Bucket.

You can get the values needed for the GHA Secrets from running `./secrets-for-gha.sh`

## Build stack

The parameters used to create this stack can be written to the parameter store using `shared/save-parameters-to-parameter-store.sh`.
These will then be used by [./create-deployment-pipeline-stack.sh](./deploy-deployment-pipeline-stack.sh) (which invokes [../shared/create-deployment-pipeline-stack.sh](../shared/deploy-deployment-pipeline-stack.sh)) to create or update the stack.
