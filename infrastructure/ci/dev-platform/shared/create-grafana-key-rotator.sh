#!/bin/bash

set -eu

if [[ "$#" -ne 2 || ! "development  build  staging  integration production" =~ ( |^)$1( |$) ]]; then
  echo "Usage: $0 <development | build | staging | integration | production> <grafana-key-secret-name>"
  echo "or"
  echo "SECRET_VALUE=<grafana-api-key> $0 <development | build | staging | integration | production> <grafana-key-secret-name>"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="$1"
SECRET_NAME="$2"

../../../check-aws-account.sh "$ACCOUNT" || exit

if [[ "$ACCOUNT" == "production" ]]; then
  GRAFANA_ENVIRONMENT="prod"
else
  GRAFANA_ENVIRONMENT="non-prod"
fi

if [[ "$ACCOUNT" == "development" ]]; then
  DEVPLATFORM_ENVIRONMENT="dev"
else
  DEVPLATFORM_ENVIRONMENT="$ACCOUNT"
fi

if ! aws secretsmanager describe-secret --secret-id "$SECRET_NAME" &> /dev/null; then
  if [[ "${SECRET_VALUE:-}" == "" ]]; then
    echo "A secret with the name $SECRET_NAME does not exist"
    echo "You can run this command again with the environment variable SECRET_VALUE set to the secret's value or you can provide it now."
    read -rp 'Enter the value of the secret (or control-c to quit): ' SECRET_VALUE
  fi

  if [[ "$SECRET_VALUE" == "" ]]; then
    echo "Stopping here because there was no secret value supplied"
    exit 1
  fi

  if ! aws secretsmanager create-secret --name "$SECRET_NAME" --secret-string "$SECRET_VALUE"; then
    echo "Couldn't create secret"
    exit
  fi
fi

aws cloudformation create-stack --stack-name grafana-key-rotation \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/grafana-key-rotation/template.yaml \
  --capabilities CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  --region eu-west-2 \
  --parameters ParameterKey=GrafanaKeySecretId,ParameterValue="$SECRET_NAME" \
  ParameterKey=GrafanaEnvironment,ParameterValue="$GRAFANA_ENVIRONMENT" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="$DEVPLATFORM_ENVIRONMENT" \
  Key=Owner,Value="DI self-service team"

popd > /dev/null
