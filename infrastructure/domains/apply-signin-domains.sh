#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT=$(../check-aws-account.sh --get-account-name) || exit $?

../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name "$ACCOUNT"-hosted-zone \
  --template sse-domains.yml \
  --tags sse:stack-type=dns

popd > /dev/null
