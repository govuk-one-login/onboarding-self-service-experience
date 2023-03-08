#!/usr/bin/env bash
set -eu


echo Creating stack for VPC


if [[ "$1" == "" ]]; then
  echo "Usage: $0 <development | build | staging | integration | production>"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="$1"
../../../check-aws-account.sh "$ACCOUNT" || exit


aws cloudformation create-stack --stack-name vpc-stack \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/vpc/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND\
  --parameters ParameterKey=VpcLinkEnabled,ParameterValue="Yes" \
  ParameterKey=LogsApiEnabled,ParameterValue="Yes" \
  ParameterKey=CloudWatchApiEnabled,ParameterValue="Yes" \
  ParameterKey=KMSApiEnabled,ParameterValue="Yes" \
  ParameterKey=DynamoDBApiEnabled,ParameterValue="Yes" \
  ParameterKey=S3ApiEnabled,ParameterValue="Yes" \
  ParameterKey=SNSApiEnabled,ParameterValue="Yes" \
  ParameterKey=KMSApiEnabled,ParameterValue="Yes" \
  ParameterKey=RestAPIGWVpcLinkEnabled,ParameterValue="Yes" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="$ACCOUNT" \
  Key=Owner,Value="DI self-service team"