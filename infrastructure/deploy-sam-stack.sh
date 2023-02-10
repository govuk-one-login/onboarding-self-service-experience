#!/usr/bin/env bash
set -e

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
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
  -a | --account)
    shift
    ACCOUNT=$1
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
    BUILD_BASE_DIR=$1
    ;;
  -c | --cached)
    CACHED=true
    ;;
  -p | --parallel)
    PARALLEL=true
    ;;
  -y | --no-confirm)
    NO_CONFIRM=true
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

"$BASE_DIR"/check-aws-account.sh "${ACCOUNT:-}" 2> /dev/null && CREDS=true || CREDS=false
[[ $TEMPLATE ]] && ! [[ -f $TEMPLATE ]] && echo "File '$TEMPLATE' does not exist" && exit 1
[[ -f samconfig.toml || -f $CONFIG_FILE ]] && CONFIG=true
${SKIP_BUILD:-false} && BUILD=false
TAGS+=(DeploymentSource=Manual)

: ${BUILD:=false}
: ${DEPLOY:=true}
: "${PREFIX:=$STACK_NAME}"

$DEPLOY && ! $CREDS && echo "Authenticate to${ACCOUNT:+" the '$ACCOUNT' account in"} AWS before deploying the stack" && exit 1
export AWS_DEFAULT_REGION=eu-west-2

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

if $BUILD && $CREDS; then
  echo "Validating template..."
  sam validate ${TEMPLATE:+--template "$TEMPLATE"}
  sam validate ${TEMPLATE:+--template "$TEMPLATE"} --lint
fi

if $BUILD; then
  echo "Building${TEMPLATE:+" template '$TEMPLATE'"}..."
  sam build \
    ${TEMPLATE:+--template "$TEMPLATE"} \
    ${BUILD_BASE_DIR:+--base-dir "$BUILD_BASE_DIR"} \
    ${PARALLEL:+--parallel} \
    ${CACHED:+--cached}
fi

$DEPLOY || exit 0
$BUILD || [[ -e .aws-sam/build/template.yaml ]] && unset TEMPLATE
${NO_CONFIRM:-false} && CONFIRM_OPTION="--no-confirm-changeset"

sam deploy \
  ${STACK_NAME:+--stack-name "$STACK_NAME"} \
  ${PREFIX:+--s3-prefix "$PREFIX"} \
  ${CONFIG:---resolve-s3} \
  --disable-rollback \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  ${CONFIRM_OPTION:---confirm-changeset} \
  ${TEMPLATE:+--template "$TEMPLATE"} \
  ${TAGS:+--tags "${TAGS[@]}"} \
  ${PARAMS:+--parameter-overrides "${PARAMS[@]}"} \
  ${CONFIG_FILE:+--config-file "$CONFIG_FILE"} \
  ${CONFIG_ENV:+--config-env "$CONFIG_ENV"} \
  ${GUIDED:+--guided}
