#!/usr/bin/env bash
# Deploy and run a local stack against an AWS backend
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

COMMANDS=(api cognito dynamodb all run admin-tool help)
USER_NAME=$(../aws.sh get-user-name development)
LOG_PREFIX=/self-service/dev
REPO_ROOT=$(pwd)/../..
OPTION_REGEX="^--?.*"
DEV_PREFIX=dev

function help {
  echo "deploy.sh [$(IFS="|" && echo "${COMMANDS[*]}")] [prefix] [SAM deploy options]" && exit
}

function get-export {
  jq --exit-status --raw-output --arg name "$1" '.[] | select(.Name | endswith($name)) | .Value' <<< "$exports" ||
    echo "𝙭 Export '$1' not found" >&2
}

function set-prefix {
  [[ ${STACK_PREFIX:-} ]] && return
  STACK_PREFIX=$(tr "." "-" <<< "$USER_NAME")
  echo "Stack prefix not set; using the default prefix '$STACK_PREFIX'"
}

function deploy-backend-component {
  local component=$1 template
  pushd "$REPO_ROOT"/backend/"$component" > /dev/null

  [[ ${OPTIONS[*]} =~ --config-file ]] || [[ -f samconfig.toml ]] || set-prefix
  [[ ${OPTIONS[*]} =~ --template|--template-file|-f ]] || template=$component.template.yml

  "$REPO_ROOT"/infrastructure/deploy-sam-stack.sh "${@:2}" "${OPTIONS[@]}" \
    --account development \
    ${template:+--template "$template"} \
    ${STACK_PREFIX:+--stack-name $DEV_PREFIX-$STACK_PREFIX-$component} \
    --tags sse:component="$component" sse:stack-type=dev sse:stack-role=application sse:owner="$USER_NAME" \
    --params ${STACK_PREFIX:+ExportNamePrefix=$DEV_PREFIX-$STACK_PREFIX}

  popd > /dev//null
}

function run {
  [[ ${STACK_PREFIX:-} ]] || set-prefix
  exports=$(aws cloudformation list-exports --query "Exports[?starts_with(Name, '$DEV_PREFIX-$STACK_PREFIX')]")
  [[ $exports == "[]" ]] && echo "No exports found for stack prefix '$STACK_PREFIX'" && exit

  COGNITO_USER_POOL_ID=$(get-export CognitoUserPoolID) COGNITO_CLIENT_ID=$(get-export CognitoUserPoolClientID) \
  SESSIONS_TABLE=$(get-export SessionsTableName) API_BASE_URL=$(get-export APIBaseURL) \
  COGNITO_CLIENT=CognitoClient LAMBDA_FACADE=LambdaFacade npm run dev
}

function dynamodb {
  deploy-backend-component dynamodb
}

function cognito {
  deploy-backend-component cognito --build
}

function api {
  deploy-backend-component api --build --base-dir "$REPO_ROOT" --params LogGroupNamePrefix=$LOG_PREFIX
}

function all {
  echo "Deploying the Admin Tool stack set"
  cognito
  dynamodb
  api
}

function admin-tool {
  deploy
  run
}

[[ ${COMMANDS[*]} =~ ${1:-} ]] && COMMAND=$1 && shift
[[ ${1:--} =~ $OPTION_REGEX ]] || { STACK_PREFIX=$1 && shift; }

OPTIONS=("$@")
${COMMAND:-all}
