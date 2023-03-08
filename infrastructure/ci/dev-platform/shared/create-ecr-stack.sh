#!/usr/bin/env bash
set -eu

echo Creating stack for ECR

if [[ "$1" == "" ]]; then
  echo "Usage: $0 <development | build | staging | integration | production>"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="$1"
PIPELINE_STACK_NAME=$2

../../../check-aws-account.sh "$ACCOUNT" || exit


aws cloudformation create-stack --stack-name container-image-repository \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/container-image-repository/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND\
  --parameters ParameterKey=AWSOrganizationId,ParameterValue='o-pjzf8d99ys\,o-dpp53lco28' \
  ParameterKey=PipelineStackName,ParameterValue="$PIPELINE_STACK_NAME" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="$ACCOUNT" \
  Key=Owner,Value="DI self-service team"