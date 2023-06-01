#!/usr/bin/env bash
# Apply domain config to an AWS account
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

ACCOUNT=$(../aws.sh get-current-account-name)

../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name "$ACCOUNT"-hosted-zone \
  --template sse-domains.yml \
  --tags sse:stack-type=dns
