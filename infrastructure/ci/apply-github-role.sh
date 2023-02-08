#!/usr/bin/env bash
set -eu

PROVIDER_ARN=$(aws iam list-open-id-connect-providers |
  jq -r '.OpenIDConnectProviderList[].Arn' |
  grep token.actions.githubusercontent.com || true)

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

../deploy-sam-stack.sh "$@" \
  --stack-name github-actions-role-sse \
  --template github-actions-role.yml \
  --tags StackType=GitHubActionsRole \
  --params OIDCProviderArn="$PROVIDER_ARN"

popd > /dev/null
