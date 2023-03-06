#!/bin/bash

set -eu

if [[ "$1" == "" ]]; then
  echo "Usage: $0 <development | build | staging | integration | production>"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="$1"

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

aws cloudformation create-stack --stack-name grafana-metrics \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/grafana-metrics/template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --region eu-west-2 \
  --parameters ParameterKey=GrafanaEnvironment,ParameterValue="$GRAFANA_ENVIRONMENT" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="$DEVPLATFORM_ENVIRONMENT" \
  Key=Owner,Value="DI self-service team"

popd > /dev/null
