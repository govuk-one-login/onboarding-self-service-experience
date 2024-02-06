#!/usr/bin/env bash
# The "it just works" script to deploy backend stacks and run a local Admin Tool frontend against them
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu -o pipefail

declare -A ENV=(
  [API_BASE_URL]=API-BaseURL
  [SESSIONS_TABLE]=DynamoDB-SessionsTableName
  [COGNITO_USER_POOL_ID]=Cognito-UserPoolID
  [COGNITO_CLIENT_ID]=Cognito-UserPoolClientID
)

declare -A SECRETS=(
  [SESSION_SECRET]=frontend/session-secret
  [GOOGLE_SHEET_CREDENTIALS]=frontend/google-sheet-credentials
  [USER_SIGNUP_SHEET_ID]=frontend/user-signup-sheet-id
)

declare -A PARAMETERS=(
  [USER_SIGNUP_SHEET_DATA_RANGE]=frontend/user-signup-sheet-data-range
  [USER_SIGNUP_SHEET_HEADER_RANGE]=frontend/user-signup-sheet-header-range
  [PUBLIC_BETA_SHEET_DATA_RANGE]=frontend/public-beta-sheet-data-range
  [PUBLIC_BETA_SHEET_HEADER_RANGE]=frontend/public-beta-sheet-header-range
)

COMPONENTS=(frontend cognito dynamodb api)
DEPLOY_CMDS=("${COMPONENTS[@]}" all admin-tool)
COMMANDS=("${DEPLOY_CMDS[@]}" run open list exports delete help)

../aws.sh check-current-account development &> /dev/null || eval "$(gds aws di-onboarding-development -e)"
USER_NAME=$(../aws.sh get-user-name)
ECR_REPO=self-service/frontend
REPO_ROOT=$(pwd)/../..
OPTION_REGEX="^--?.*"
DEV_PREFIX=dev

function help {
  (IFS="|" && echo "deploy.sh [${COMMANDS[*]}] [prefix] [SAM deploy options]") && exit
}

function get-export {
  jq --exit-status --raw-output --arg name "$STACK_PREFIX-$1" '.[] | select(.Name == $name) | .Value' <<< "$exports"
}

function get-secret {
  aws secretsmanager get-secret-value --secret-id "/self-service/$1" --query SecretString --output text
}

function get-parameter {
  aws ssm get-parameter --name "/self-service/$1" --query "Parameter.Value" --output text
}

function set-prefix {
  [[ ${STACK_PREFIX:-} ]] && return || STACK_PREFIX=${1:-}

  if ! [[ ${STACK_PREFIX:-} ]]; then
    STACK_PREFIX=$(tr "." "-" <<< "$USER_NAME")
    echo "𝓲 Stack prefix not set; using the default prefix '$STACK_PREFIX'" >&2
  fi

  STACK_PREFIX=$DEV_PREFIX-${STACK_PREFIX##"${DEV_PREFIX}"-}
}

function get-env-vars {
  local exports var secret
  exports=$(aws cloudformation list-exports --query "Exports[?starts_with(Name, '$STACK_PREFIX-')]")
  [[ $exports == "[]" ]] && echo "No exports found for stack prefix '$STACK_PREFIX'" && exit

  for var in "${!ENV[@]}"; do
    env+=("$var=$(get-export "${ENV[$var]}")") && continue
    echo "𝙭 Export '${ENV[$var]}' not found" >&2 && return 1
  done

  for param in "${!PARAMETERS[@]}"; do
    env+=("$param=$(get-parameter "${PARAMETERS[$param]}")") && continue
    echo "𝙭 Param '${PARAMETERS[$param]}' not found" >&2 && return 1
  done
}

function exports {
  get-env-vars
  (IFS=$'\n' && echo "${env[*]}")
}

function list {
  [[ ${OPTIONS[*]} =~ --all ]] && OPTIONS=("${OPTIONS[*]//--all/}") && local all=true
  aws cloudformation describe-stacks | (IFS="|" && jq --raw-output \
    --arg regex "$STACK_PREFIX${all:+.*}-(${OPTIONS[*]:-${COMPONENTS[*]}})" \
    '.Stacks[] | select(.StackName | match($regex)) | .StackName')
}

function delete {
  local stack
  for stack in $(list); do
    sam delete --no-prompts --region "${AWS_REGION:-${AWS_DEFAULT_REGION}}" --stack-name "$stack"
  done
}

function deploy-backend-component {
  local component=$1
  deploy "$REPO_ROOT"/backend/"$component" "$component" "${@:2}"
}

function deploy {
  local dir=$1 component=$2 template
  pushd "$dir" > /dev/null

  [[ ${OPTIONS[*]} =~ --template|--template-file|-f ]] || template=$component.template.yml

  "$REPO_ROOT"/infrastructure/deploy-sam-stack.sh "${@:3}" "${OPTIONS[@]}" \
    --account development \
    ${template:+--template $template} \
    ${STACK_PREFIX:+--stack-name $STACK_PREFIX-$component} \
    --tags sse:component="$component" sse:stack-type=dev sse:stack-role=application sse:owner="$USER_NAME" \
    --params ${STACK_PREFIX:+DeploymentName=$STACK_PREFIX}

  popd > /dev/null
}

function build-frontend-image {
  local branch commit repo image

  repo=$(aws ecr describe-repositories --repository-names $ECR_REPO --output text --query "repositories[0].repositoryUri")
  commit=$(git rev-parse HEAD)
  image_uri="$repo:$commit"

  image=$(aws ecr list-images --repository-name $ECR_REPO --query "imageIds[?imageTag=='$commit']")
  [[ $image != "[]" ]] && echo "Image for commit $commit is present in ECR" && return 0

  branch=$(git branch --show-current)
  image=$(aws ecr describe-images --repository-name $ECR_REPO --image-ids imageTag="$branch" \
    --query imageDetails[0].imageDigest --output text 2> /dev/null) &&
    aws ecr batch-delete-image --repository-name $ECR_REPO --image-ids imageDigest="$image" > /dev/null &&
    echo "» Deleted image for branch $branch"

  echo "» Building frontend"
  npm run build-express --include-workspace-root &> /dev/null

  echo "» Building Docker image"
  docker build --quiet --platform linux/amd64 --tag "$repo:$branch" --tag "$image_uri" \
    --file ../frontend/Dockerfile "$REPO_ROOT"

  echo "» Pushing image to ECR"
  docker push --quiet "$repo:$branch" && docker push --quiet "$image_uri"
}

function run {
  get-env-vars && (IFS=$'\n' && echo "${env[*]}") || exit
  echo eval "${env[*]}" STUB_API=false npm run dev
  for secret in "${!SECRETS[@]}"; do
    export "$secret=$(get-secret "${SECRETS[$secret]}")"
  done
  eval "${env[*]}" STUB_API=false npm run dev
}

function open {
  local url
  [[ $STACK_PREFIX ]] || exit
  url=$(../aws.sh get-stack-outputs "$STACK_PREFIX"-frontend AdminToolURL | jq --raw-output .value) &&
    echo "Opening $url..." && command open https://"${url##https://}" && exit ||
    echo "𝙭 Remote frontend not deployed for prefix '${STACK_PREFIX##"${DEV_PREFIX}"-}'" && exit 1
}

function frontend {
  [[ $(list) ]] || all --params PrivateAPI=true

  build-frontend-image
  deploy "$REPO_ROOT"/infrastructure/frontend frontend --params ImageURI="$image_uri"

  if [[ $STACK_PREFIX ]]; then
    echo
  fi

  open
}

function dynamodb {
  deploy-backend-component dynamodb
}

function cognito {
  deploy-backend-component cognito --build
}

function api {
  deploy-backend-component api --build --base-dir "$REPO_ROOT" --params PrivateAPI=false
}

function all {
  echo "Deploying the Admin Tool stack set"
  dynamodb
  cognito
  api
}

function admin-tool {
  all
  run
}

[[ ${COMMANDS[*]} =~ ${1:-} ]] && COMMAND=$1 && shift || COMMAND=all
[[ ${1:--} =~ $OPTION_REGEX ]] || { set-prefix "$1" && shift; }

OPTIONS=("$@")
set-prefix
$COMMAND
