#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

function get-param {
  jq --raw-output --arg name "$2" '.[] | select(.OutputKey == $name) | .OutputValue' <<< "$1"
}

function get-signing-config {
  local initial_account=$1 signing_params
  signing_params=$(gds aws di-onboarding-"$initial_account" -- aws cloudformation describe-stacks \
    --stack-name deployment-support --query "Stacks[0].Outputs[?contains(OutputKey, 'Sign')]")

  signing_profile=$(get-param "$signing_params" SigningProfileARN)
  signing_profile_version=$(get-param "$signing_params" SigningProfileVersionARN)
  container_signing_key=$(get-param "$signing_params" ContainerSigningKeyARN)
}

function get-source-config {
  local account=$1 previous_account outputs
  previous_account=$(../../aws.sh get-previous-account-name "$account")
  outputs=$(gds aws di-onboarding-"$previous_account" -- sam list stack-outputs --stack-name deployers --output json)

  api_source_bucket=$(get-param "$outputs" APIPromotionBucket)
  cognito_source_bucket=$(get-param "$outputs" CognitoPromotionBucket)
  dynamodb_source_bucket=$(get-param "$outputs" DynamoDBPromotionBucket)
  frontend_source_bucket=$(get-param "$outputs" FrontendPromotionBucket)
}

ACCOUNT=$(../../aws.sh get-current-account-name)
NEXT_ACCOUNT=$(../../aws.sh get-next-account "$ACCOUNT")
INITIAL_ACCOUNT=$(../../aws.sh get-initial-account "$ACCOUNT")

get-signing-config "$INITIAL_ACCOUNT"

[[ $ACCOUNT != "$INITIAL_ACCOUNT" ]] && get-source-config "$ACCOUNT" || ENV=build
[[ $ACCOUNT == development ]] && ENV=dev

../../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name deployers \
  --template deployment-pipelines.template.yml \
  --tags Product="GOV.UK One Login" System="Dev Platform" Service="ci/cd" Owner="Self-Service Team" Environment="${ENV:-$ACCOUNT}" \
  --parameters Environment="${ENV:-$ACCOUNT}" NextAccount="${NEXT_ACCOUNT:-''}" ContainerSigningKeyARN="$container_signing_key" \
  SigningProfileARN="$signing_profile" SigningProfileVersionARN="$signing_profile_version" \
  APISourceBucketARN="${api_source_bucket:-none}" CognitoSourceBucketARN="${cognito_source_bucket:-none}" \
  DynamoDBSourceBucketARN="${dynamodb_source_bucket:-none}" FrontendSourceBucketARN="${frontend_source_bucket:-none}"
