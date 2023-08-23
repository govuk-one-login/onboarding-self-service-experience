#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

function get-param {
  jq --raw-output --arg name "$2" '.[] | select(.OutputKey == $name) | .OutputValue' <<< "$1"
}

function get-signing-config {
  local signing_params
  signing_params=$(gds aws di-onboarding-"$INITIAL_ACCOUNT" -- aws cloudformation describe-stacks \
    --stack-name "$STACK_NAME"-support --query "Stacks[0].Outputs[?contains(OutputKey, 'Sign')]")

  signing_profile=$(get-param "$signing_params" SigningProfileARN)
  signing_profile_version=$(get-param "$signing_params" SigningProfileVersionARN)
  container_signing_key=$(get-param "$signing_params" ContainerSigningKeyARN)
}

function get-source-config {
  local previous_account outputs
  previous_account=$(../../aws.sh get-previous-account-name "$ACCOUNT")
  outputs=$(gds aws di-onboarding-"$previous_account" -- sam list stack-outputs --stack-name "$STACK_NAME" --output json)

  api_source_bucket=$(get-param "$outputs" APIPromotionBucket)
  cognito_source_bucket=$(get-param "$outputs" CognitoPromotionBucket)
  dynamodb_source_bucket=$(get-param "$outputs" DynamoDBPromotionBucket)
  frontend_source_bucket=$(get-param "$outputs" FrontendPromotionBucket)
}

ACCOUNT=$(../../aws.sh get-current-account-name)
INITIAL_ACCOUNT=$(../../aws.sh get-initial-account "$ACCOUNT")
STACK_NAME=secure-pipelines

[[ $ACCOUNT == "$INITIAL_ACCOUNT" ]] || get-source-config
[[ $ACCOUNT == development ]] && ENV=dev || NEXT_ACCOUNT=$(../../aws.sh get-next-account "$ACCOUNT")
: ${ENV:=$ACCOUNT}

get-signing-config
../../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name "$STACK_NAME" \
  --template deployment-pipelines.template.yml \
  --tags Product="GOV.UK One Login" System="Dev Platform" Service="ci/cd" Owner="Self-Service Team" Environment="$ENV" \
  --parameters Environment="$ENV" NextAccount="${NEXT_ACCOUNT:-''}" \
  SigningProfileARN="$signing_profile" SigningProfileVersionARN="$signing_profile_version" \
  APISourceBucketARN="${api_source_bucket:-none}" CognitoSourceBucketARN="${cognito_source_bucket:-none}" \
  DynamoDBSourceBucketARN="${dynamodb_source_bucket:-none}" FrontendSourceBucketARN="${frontend_source_bucket:-none}" \
  ContainerSigningKeyARN="${container_signing_key:-none}"

if [[ $ACCOUNT == "$INITIAL_ACCOUNT" ]]; then
  ../configure-github-repo.sh update-deployment-environment "$ACCOUNT"-secure-pipelines $STACK_NAME \
    DeploymentRoleArn ArtifactSourceBucketName FrontendECRRepositoryName PipelineName
fi
