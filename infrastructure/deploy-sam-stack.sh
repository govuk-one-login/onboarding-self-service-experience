#!/usr/bin/env bash
set -e

OPTION_REGEX="^--?.*"

while [[ -n $1 ]]; do
  case $1 in
  -f | --template | --template-file)
    shift
    TEMPLATE=$1
    ;;
  -n | --stack-name)
    shift
    [[ -z ${1:-} || $1 =~ $OPTION_REGEX ]] && echo "Invalid stack name: '$1'" && exit 1
    STACK_NAME=$1
    ;;
  -s3 | --prefix | --s3-prefix)
    shift
    PREFIX=$1
    ;;
  -t | --tags)
    TAGS=()
    while [[ $2 ]] && ! [[ $2 =~ $OPTION_REGEX ]]; do
      shift
      TAGS+=("$1")
    done
    ;;
  -o | --params | --parameters | --parameter-overrides)
    PARAMS=()
    while [[ $2 ]] && ! [[ $2 =~ $OPTION_REGEX ]]; do
      shift
      PARAMS+=("$1")
    done
    ;;
  -b | --build)
    BUILD=true
    ;;
  -d | --no-build)
    SKIP_BUILD=true
    ;;
  -x | --no-deploy)
    DEPLOY=false
    ;;
  -s | --base-dir)
    shift
    BASE_DIR=$1
    ;;
  -c | --cached)
    CACHED="--cached"
    ;;
  -p | --parallel)
    PARALLEL=true
    ;;
  -y | --no-confirm)
    NO_CONFIRM="--no-confirm-changeset"
    ;;
  -g | --guided)
    GUIDED=true
    ;;
  --config-file)
    shift
    CONFIG_FILE=$1
    ;;
  --config-env)
    shift
    CONFIG_ENV=$1
    ;;
  *)
    echo "Unknown option '$1'"
    exit 1
    ;;
  esac
  shift
done

[[ $TEMPLATE ]] && ! [[ -f $TEMPLATE ]] && echo "File '$TEMPLATE' does not exist" && exit 1
[[ -f samconfig.toml || -f $CONFIG_FILE ]] && CONFIG=true
${SKIP_BUILD:-false} && BUILD=false
TAGS+=(DeploymentSource=Manual)

: ${DEPLOY:=true}
: ${BUILD:=false}
: "${PREFIX:=$STACK_NAME}"

if ! aws sts get-caller-identity > /dev/null 2>&1; then
  echo "Valid AWS credentials not found in the environment. Authenticate to AWS before deploying a stack."
  $DEPLOY && exit 1 || CREDS=false
else
  CREDS=true
fi

if $DEPLOY; then
  if [[ $STACK_NAME || $CONFIG || $GUIDED ]]; then
    echo "Deploying${STACK_NAME:+" stack '$STACK_NAME'"}${TEMPLATE:+" from template '$TEMPLATE'"}"
    [[ $PREFIX ]] && echo "  with S3 prefix '$PREFIX'"
    [[ ${#TAGS[@]} -gt 0 ]] && echo "  with tags '${TAGS[*]}'"
    [[ ${#PARAMS[@]} -gt 0 ]] && echo "  with params '${PARAMS[*]}'"
  else
    echo "Stack name not provided - not deploying (use the --stack-name|-n or --guided option)" && DEPLOY=false
  fi
fi

export AWS_DEFAULT_REGION=eu-west-2

if $BUILD && $CREDS; then
  echo "Validating template..."
  sam validate ${TEMPLATE:+--template "$TEMPLATE"}
  sam validate ${TEMPLATE:+--template "$TEMPLATE"} --lint
fi

if $BUILD; then
  echo "Building${TEMPLATE:+" template '$TEMPLATE'"}..."
  sam build \
    ${TEMPLATE:+--template "$TEMPLATE"} \
    ${BASE_DIR:+--base-dir "$BASE_DIR"} \
    ${PARALLEL:+--parallel} \
    ${CACHED:---no-cached}
fi

$DEPLOY || exit 0
$BUILD || [[ -e .aws-sam/build/template.yaml ]] && unset TEMPLATE

sam deploy \
  ${STACK_NAME:+--stack-name "$STACK_NAME"} \
  ${PREFIX:+--s3-prefix "$PREFIX"} \
  ${CONFIG:---resolve-s3} \
  --disable-rollback \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  ${TEMPLATE:+--template "$TEMPLATE"} \
  ${NO_CONFIRM:---confirm-changeset} \
  ${TAGS:+--tags "${TAGS[@]}"} \
  ${PARAMS:+--parameter-overrides "${PARAMS[@]}"} \
  ${CONFIG_FILE:+--config-file "$CONFIG_FILE"} \
  ${CONFIG_ENV:+--config-env "$CONFIG_ENV"} \
  ${GUIDED:+--guided}
