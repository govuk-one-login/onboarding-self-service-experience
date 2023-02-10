#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../check-aws-account.sh development > /dev/null

PROVIDER_ARN=$(aws iam list-open-id-connect-providers \
  --query "OpenIDConnectProviderList[?contains(Arn, 'token.actions.githubusercontent.com')].Arn" \
  --output text)

FRONTEND_STACK=$(aws cloudformation describe-stacks \
  --stack-name sse-frontend-infrastructure \
  --query "Stacks[].StackName" \
  --output text 2> /dev/null)

../deploy-sam-stack.sh "$@" \
  --account development \
  --stack-name github-actions-role-sse \
  --template github-actions-role.yml \
  --tags StackType=GitHubActionsRole \
  --params \
  OIDCProviderArn="$PROVIDER_ARN" \
  CreateDeploymentArtifactsBucket=true \
  FrontendInfrastructureStack="${FRONTEND_STACK:-}"

popd > /dev/null
