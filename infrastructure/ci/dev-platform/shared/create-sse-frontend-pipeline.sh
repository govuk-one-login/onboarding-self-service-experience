#!/usr/bin/env bash
set -eu

echo Creating stack for Frontend Pipeline

if [[ "$1" == "" ]]; then
  echo "Usage: $0 <development | build | staging | integration | production>"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="$1"
PIPELINE_ENV="$2"
ALLOWED_ACCOUNTS="$3"
CONTAINER_SIGNER_ARN="$4"
SIGNER_PROFILE_ARN="$5"
SIGNER_PROFILE_VERSION_ARN="$6"

../../../check-aws-account.sh "$ACCOUNT" || exit

aws cloudformation create-stack --stack-name sse-frontend-pipeline \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/sam-deploy-pipeline/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND --parameters ParameterKey=Environment,ParameterValue="$PIPELINE_ENV" \
  ParameterKey=SAMStackName,ParameterValue="sse-frontend-app" \
  ParameterKey=VpcStackName,ParameterValue="sse-vpc-stack" \
  ParameterKey=IncludePromotion,ParameterValue="No" \
  ParameterKey=AWSOrganizationId,ParameterValue='o-pjzf8d99ys\,o-dpp53lco28' \
  ParameterKey=AllowedAccounts,ParameterValue="$ALLOWED_ACCOUNTS" \
  ParameterKey=ContainerSignerKmsKeyArn,ParameterValue="$CONTAINER_SIGNER_ARN" \
  ParameterKey=SigningProfileArn,ParameterValue="$SIGNER_PROFILE_ARN" \
  ParameterKey=SigningProfileVersionArn,ParameterValue="$SIGNER_PROFILE_VERSION_ARN" \
  ParameterKey=GitHubRepositoryName,ParameterValue="di-onboarding-self-service-experience" \
  ParameterKey=ProgrammaticPermissionsBoundary,ParameterValue="True" \
  ParameterKey=AllowedServiceOne,ParameterValue="ECR & ECS" \
  ParameterKey=SlackNotificationType,ParameterValue="All" \
  ParameterKey=BuildNotificationStackName,ParameterValue="sse-slack-notify" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="$ACCOUNT" \
  Key=Owner,Value="DI self-service team"
