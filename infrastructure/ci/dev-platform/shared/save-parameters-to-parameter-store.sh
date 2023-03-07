#!/bin/bash

set -eu

declare -r USAGE="Usage: $0 <stack-name>"

if [[ "-h --help" =~ ( |^)${1:---help}( |$) ]]; then
  echo "$USAGE"
  exit 1
fi

if [[ "$#" -ne 1 ]]; then
  echo "$USAGE"
  exit 1
fi

STACK_NAME="$1"

if STACK_DESCRIPTION="$(aws cloudformation describe-stacks --stack-name "$STACK_NAME")"; then

  PARAMETERS=$(echo "$STACK_DESCRIPTION" | jq --arg STACK_NAME "$STACK_NAME" '.Stacks[] | select(.StackName == $STACK_NAME) | .Parameters')
  TAGS=$(echo "$STACK_DESCRIPTION" | jq --arg STACK_NAME "$STACK_NAME" '.Stacks[] | select(.StackName == $STACK_NAME) | .Tags')

  declare -r BASE_PARAMETER_NAME="/self-service/devplatform/$STACK_NAME"

  aws ssm put-parameter --name "$BASE_PARAMETER_NAME/parameters" \
    --value "$PARAMETERS" \
    --type String \
    --overwrite

  aws ssm put-parameter --name "$BASE_PARAMETER_NAME/tags" \
    --value "$TAGS" \
    --type String \
    --overwrite

  echo ===== PARAMETERS =====
  echo "$PARAMETERS"
  echo ======================
  echo
  echo ======== TAGS ========
  echo "$TAGS"
  echo ======================
fi
