#!/usr/bin/env bash
# The "it just works" script to deploy backend stacks and run a local Admin Tool frontend against them
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

declare -A ENV=(
  [API_BASE_URL]=API-BaseURL
  [SESSIONS_TABLE]=DynamoDB-SessionsTableName
  [COGNITO_USER_POOL_ID]=Cognito-UserPoolID
  [COGNITO_CLIENT_ID]=Cognito-UserPoolClientID
)

COMPONENTS=(cognito dynamodb api)
DEPLOY_CMDS=("${COMPONENTS[@]}" all admin-tool)
COMMANDS=("${DEPLOY_CMDS[@]}" run list delete help)

../aws.sh check-current-account development &> /dev/null || eval "$(gds aws di-onboarding-development -e)"
USER_NAME=$(../aws.sh get-user-name)
LOG_PREFIX=/self-service/dev
REPO_ROOT=$(pwd)/../..
OPTION_REGEX="^--?.*"
DEV_PREFIX=dev

function help {
  (IFS="|" && echo "deploy.sh [${COMMANDS[*]}] [prefix] [SAM deploy options]") && exit
}

function get-export {
  jq --exit-status --raw-output --arg name "$STACK_PREFIX-$1" '.[] | select(.Name == $name) | .Value' <<< "$exports"
}

function set-prefix {
  [[ ${STACK_PREFIX:-} ]] && return || STACK_PREFIX=${1:-}

  if ! [[ ${STACK_PREFIX:-} ]]; then
    STACK_PREFIX=$(tr "." "-" <<< "$USER_NAME")
    echo "𝓲 Stack prefix not set; using the default prefix '$STACK_PREFIX'" >&2
  fi

  STACK_PREFIX=$DEV_PREFIX-$STACK_PREFIX
}

function get-env-vars {
  exports=$(aws cloudformation list-exports --query "Exports[?starts_with(Name, '$STACK_PREFIX-')]")
  [[ $exports == "[]" ]] && echo "No exports found for stack prefix '$STACK_PREFIX'" && exit

  local var
  for var in "${!ENV[@]}"; do
    env+=("$var=$(get-export "${ENV[$var]}")") && continue
    echo "𝙭 Export '${ENV[$var]}' not found" >&2 && return 1
  done
}

function list {
  [[ ${OPTIONS[*]} == --all ]] && local all=true
  aws cloudformation describe-stacks | (IFS="|" && jq --raw-output \
    --arg regex "$STACK_PREFIX${all:+.*}-(${COMPONENTS[*]})" \
    '.Stacks[] | select(.StackName | match($regex)) | .StackName')
}

function delete {
  local stack
  for stack in $(list); do
    sam delete --no-prompts --region "${AWS_REGION:-${AWS_DEFAULT_REGION}}" --stack-name "$stack"
  done
}

function deploy-backend-component {
  local component=$1 template
  pushd "$REPO_ROOT"/backend/"$component" > /dev/null

  [[ ${OPTIONS[*]} =~ --config-file ]] || [[ -f samconfig.toml ]] || set-prefix
  [[ ${OPTIONS[*]} =~ --template|--template-file|-f ]] || template=$component.template.yml

  "$REPO_ROOT"/infrastructure/deploy-sam-stack.sh "${@:2}" "${OPTIONS[@]}" \
    --account development \
    ${template:+--template $template} \
    ${STACK_PREFIX:+--stack-name $STACK_PREFIX-$component} \
    --tags sse:component="$component" sse:stack-type=dev sse:stack-role=application sse:owner="$USER_NAME" \
    --params ${STACK_PREFIX:+DeploymentName=$STACK_PREFIX}

  popd > /dev/null
}

function run {
  get-env-vars && (IFS=$'\n' && echo "${env[*]}") || exit
  eval "${env[*]}" COGNITO_CLIENT=CognitoClient LAMBDA_FACADE=LambdaFacade npm run dev
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
  all
  run
}

[[ ${COMMANDS[*]} =~ ${1:-} ]] && COMMAND=$1 && shift
[[ ${1:--} =~ $OPTION_REGEX ]] || { set-prefix "$1" && shift; }
[[ ${DEPLOY_CMDS[*]} =~ ${COMMAND:=all} ]] || set-prefix

OPTIONS=("$@")
$COMMAND
