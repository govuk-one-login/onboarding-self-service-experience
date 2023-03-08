#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="build"
PIPELINE_ENV="build"
ALLOWED_ACCOUNTS="325730373996\,399055180839"
CONTAINER_SIGNER_ARN="arn:aws:kms:eu-west-2:399055180839:key/e14ffd97-149b-4a75-ab5c-f0896ca946ae"
SIGNER_PROFILE_ARN="arn:aws:signer:eu-west-2:399055180839:/signing-profiles/SigningProfile_tI0KRsWSzl5S"
SIGNER_PROFILE_VERSION_ARN="arn:aws:signer:eu-west-2:399055180839:/signing-profiles/SigningProfile_tI0KRsWSzl5S/pppMUJltD6"

../shared/create-sse-frontend-pipeline.sh "$ACCOUNT" "$PIPELINE_ENV" \
"$ALLOWED_ACCOUNTS" \
"$CONTAINER_SIGNER_ARN" \
"$SIGNER_PROFILE_ARN" \
"$SIGNER_PROFILE_VERSION_ARN" \


popd > /dev/null
