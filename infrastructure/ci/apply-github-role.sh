#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
PROVIDER_ARN=$(aws iam list-open-id-connect-providers |
  jq -r '.OpenIDConnectProviderList[].Arn' |
  grep token.actions.githubusercontent.com || true)

"$BASE_DIR"/../apply-sam-template.sh "$@" \
  --stack-name github-actions-role-sse \
  --template "$BASE_DIR"/github-actions-role.yml \
  --tags DeploymentSource=Manual StackType=GitHubActionsRole \
  --params OIDCProviderArn="$PROVIDER_ARN"
