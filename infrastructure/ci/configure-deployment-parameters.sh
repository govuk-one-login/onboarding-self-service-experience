#!/usr/bin/env bash
# Set up Parameter Store parameters required to deploy Admin Tool stacks
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

PARAMETER_NAME_PREFIX=/self-service
COGNITO_EXTERNAL_ID=$PARAMETER_NAME_PREFIX/cognito/external-id

function check-parameter-set {
  [[ $(xargs < <(get-parameter-value "$1")) ]]
}

function get-parameter-value {
  aws ssm get-parameter --name "$1" --query "Parameter.Value" --output text 2> /dev/null
}

function write-parameter-value {
  echo "Setting '$1' to '$2'"
  aws ssm put-parameter --name "$1" --value "$2" --type String --overwrite > /dev/null
}

function check-cognito-external-id {
  check-parameter-set $COGNITO_EXTERNAL_ID || write-parameter-value $COGNITO_EXTERNAL_ID "$(uuidgen)"
}

function print-parameters {
  echo "--- Deployment parameters in $(../aws.sh get-current-account-name) ---"
  echo "$COGNITO_EXTERNAL_ID: $(get-parameter-value $COGNITO_EXTERNAL_ID)"
}

function check-deployment-parameters {
  ../aws.sh check-current-account > /dev/null
  check-cognito-external-id
  print-parameters
}

check-deployment-parameters
