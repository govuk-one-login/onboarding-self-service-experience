#!/bin/bash

set -eu

if [[ "${1-}" == "" ]]; then
  echo "Usage: $0 name-of-stack"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

../../../check-aws-account.sh build > /dev/null

INITIAL_STACK_OUTPUTS="$(sam list stack-outputs --stack-name "$1" --output json)"
echo "ARTIFACT_BUCKET_NAME" = "$(echo "$INITIAL_STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey == "GitHubArtifactSourceBucketName") | .OutputValue')"
echo "GH_ACTIONS_ROLE_ARN" = "$(echo "$INITIAL_STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey == "GitHubActionsRoleArn") | .OutputValue')"

if SIGNER_STACK_OUTPUTS="$(sam list stack-outputs --stack-name aws-signer --output json)"; then
  echo "SIGNING_PROFILE_NAME" = "$(echo "$SIGNER_STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey == "SigningProfileName") | .OutputValue')"
fi

if CONTAINER_SIGNER_STACK_OUTPUTS="$(sam list stack-outputs --stack-name container-signer --output json)"; then
  echo "CONTAINER_SIGN_KMS_KEY" = "$(echo "$CONTAINER_SIGNER_STACK_OUTPUTS" | jq -r '.[] | select(.OutputKey == "ContainerSignerKmsKeyArn") | .OutputValue')"
fi
