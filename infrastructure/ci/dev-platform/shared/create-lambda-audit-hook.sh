#!/bin/bash

set -eu

if [[ "$#" -ne 1 || ! "development  build  staging  integration production" =~ ( |^)$1( |$) ]]; then
  echo "Usage: $0 <development | build | staging | integration | production>"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="$1"

../../../check-aws-account.sh "$ACCOUNT" || exit

if [[ "$ACCOUNT" == "development" ]]; then
  DEVPLATFORM_ENVIRONMENT="dev"
else
  DEVPLATFORM_ENVIRONMENT="$ACCOUNT"
fi

aws cloudformation create-stack --stack-name lambda-audit-hook \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/lambda-audit-hook/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_IAM \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="$DEVPLATFORM_ENVIRONMENT" \
  Key=Owner,Value="DI self-service team"
