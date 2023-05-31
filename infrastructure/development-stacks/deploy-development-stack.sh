#!/usr/bin/env bash

set -eu

declare -r USAGE="Usage: $0 <prefix-for-stack>"

if [[ "-h --help" =~ ( |^)${1:---help}( |$) ]]; then
  echo "$USAGE"
  exit 1
fi

if [[ "$#" -ne 1 ]]; then
  echo "$USAGE"
  exit 1
fi

STACK_PREFIX="$1"

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

../aws.sh check-current-account development

cat ./unnecessary-ddb-banner.txt

pushd ../../backend/dynamo-db/

sam build
sam validate
sam validate --lint
sam deploy --stack-name "${STACK_PREFIX}-dynamo-db" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides ExportNamePrefix="${STACK_PREFIX}"

popd > /dev/null

cat ./unnecessary-cognito-banner.txt

pushd ../../backend/cognito/

sam build
sam validate
sam validate --lint
sam deploy --stack-name "${STACK_PREFIX}-cognito" \
  --resolve-s3 \
  --capabilities CAPABILITY_IAM \
  --no-fail-on-empty-changeset \
  --parameter-overrides ExportNamePrefix="${STACK_PREFIX}"

popd > /dev/null

cat ./unnecessary-api-banner.txt

pushd ../..

npm run deploy-api -- --stack-name "${STACK_PREFIX}-api" --no-confirm --parameter-overrides ExportNamePrefix="${STACK_PREFIX}"

popd > /dev/null

EXPORTS=$(aws cloudformation list-exports)

FILTERED=$(echo "$EXPORTS" | jq --arg STACK_PREFIX "$STACK_PREFIX" '.Exports[] | select(.Name | startswith($STACK_PREFIX))')

cd ../../express

FILE=.env."${STACK_PREFIX}"

touch "$FILE"

SESSION_TABLE=$(echo "$FILTERED" | jq -r --arg STACK "${STACK_PREFIX}-AdminToolSessionsTable" 'select(.Name == $STACK) | .Value')
COGNITO_USER_POOL_CLIENT=$(echo "$FILTERED" | jq -r --arg STACK "${STACK_PREFIX}-CognitoUserPoolClient" 'select(.Name == $STACK) | .Value')
COGNITO_USER_POOL=$(echo "$FILTERED" | jq -r --arg STACK "${STACK_PREFIX}-CognitoUserPool" 'select(.Name == $STACK) | .Value')
SELF_SERVICE_API_BASE_URL=$(echo "$FILTERED" | jq -r --arg STACK "${STACK_PREFIX}-SelfServiceApiBaseUrl" 'select(.Name == $STACK) | .Value')

{
  echo "USERPOOL_ID=${COGNITO_USER_POOL}"
  echo "CLIENT_ID=${COGNITO_USER_POOL_CLIENT}"
  echo "API_BASE_URL=${SELF_SERVICE_API_BASE_URL}"
  echo "SESSION_STORAGE=true"
  echo "SESSIONS_TABLE=${SESSION_TABLE}"
  echo "PORT=3000"
} >> "$FILE"

echo "Go to the express directory and rename $(basename "$FILE") to .env and then start the application with your AWS credentials:"
echo "express/ % COGNITO_CLIENT=CognitoClient LAMBDA_FACADE=LambdaFacade gds aws di-onboarding-development -- npm run dev"
