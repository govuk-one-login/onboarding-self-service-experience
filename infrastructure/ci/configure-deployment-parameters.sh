#!/usr/bin/env bash
# Set up Parameter Store parameters required to deploy Admin Tool stacks
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

ACCOUNT=$(../aws.sh get-current-account-name)
PARAMETER_NAME_PREFIX=/self-service

declare -A PARAMETERS=(
  [cognito_external_id]=$PARAMETER_NAME_PREFIX/cognito/external-id
  [deletion_protection]=$PARAMETER_NAME_PREFIX/config/deletion-protection-enabled
)

function check-parameter-set {
  [[ $(xargs < <(get-parameter-value "$1")) ]]
}

function get-parameter-value {
  aws ssm get-parameter --name "${PARAMETERS[$1]}" --query "Parameter.Value" --output text 2> /dev/null
}

function write-parameter-value {
  echo "Setting '$1' to '$2'"
  aws ssm put-parameter --name "${PARAMETERS[$1]}" --value "$2" --type String --overwrite > /dev/null
}

function check-cognito-external-id {
  check-parameter-set cognito_external_id || write-parameter-value cognito_external_id "$(uuidgen)"
}

function check-deletion-protection {
  check-parameter-set deletion_protection ||
    write-parameter-value deletion_protection "$([[ $ACCOUNT == production ]] && echo ACTIVE || echo INACTIVE)"
}

function print-parameters {
  local parameter
  echo "--- Deployment parameters in $(../aws.sh get-current-account-name) ---"
  for parameter in "${!PARAMETERS[@]}"; do
    echo "${PARAMETERS[$parameter]}: $(get-parameter-value "$parameter")"
  done
}

function check-deployment-parameters {
  ../aws.sh check-current-account > /dev/null
  check-cognito-external-id
  check-deletion-protection
  print-parameters
}

check-deployment-parameters
