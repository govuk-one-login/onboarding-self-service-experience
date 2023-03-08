#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="development"
PIPELINE_ENV="build"
ALLOWED_ACCOUNTS="494650018671"
CONTAINER_SIGNER_ARN="arn:aws:kms:eu-west-2:494650018671:key/ef26b15b-c04d-4c62-b899-ccb7bb69d666"
SIGNER_PROFILE_ARN="arn:aws:signer:eu-west-2:494650018671:/signing-profiles/SigningProfile_8a0gUKtixxVk"
SIGNER_PROFILE_VERSION_ARN="arn:aws:signer:eu-west-2:494650018671:/signing-profiles/SigningProfile_8a0gUKtixxVk/8Ht683ClNM"

../shared/create-sse-frontend-pipeline.sh "$ACCOUNT" "$PIPELINE_ENV" "$ALLOWED_ACCOUNTS" "$CONTAINER_SIGNER_ARN" "$SIGNER_PROFILE_ARN" "$SIGNER_PROFILE_VERSION_ARN"

popd > /dev/null
