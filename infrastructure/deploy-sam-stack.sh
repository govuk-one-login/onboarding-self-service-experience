#!/usr/bin/env bash
# Utility script to deploy SAM stacks
BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
set -e

OPTION_REGEX="^--?.*"
BUILD=false
DEPLOY=true

while [[ -n $1 ]]; do
  case $1 in
    -n | --stack-name)
      [[ -z ${2:-} || $2 =~ $OPTION_REGEX ]] && echo "Invalid stack name: '$2'" && exit 1
      shift && STACK_NAME=$1
      ;;
    -t | --tags)
      while [[ $2 ]] && ! [[ $2 =~ $OPTION_REGEX ]]; do
        shift && TAGS+=("$1")
      done
      ;;
    -o | --params | --parameters | --parameter-overrides)
      while [[ $2 ]] && ! [[ $2 =~ $OPTION_REGEX ]]; do
        shift && PARAMS+=("$1")
      done
      ;;
    -s3 | --prefix | --s3-prefix) shift && S3_PREFIX=$1 ;;
    -f | --template | --template-file) shift && TEMPLATE=$1 ;;
    -a | --account) shift && ACCOUNT=$1 ;;
    -s | --base-dir) shift && SAM_BASE_DIR=$1 ;;
    -b | --build) BUILD=true ;;
    -d | --no-build) SKIP_BUILD=true ;;
    -x | --no-deploy) DEPLOY=false ;;
    -c | --cached) CACHED=true ;;
    -p | --parallel) PARALLEL=true ;;
    -y | --no-confirm) NO_CONFIRM=true ;;
    -r | --disable-rollback) DISABLE_ROLLBACK=true ;;
    -v | --validate) VALIDATE=true ;;
    -g | --guided) GUIDED=true ;;
    --config-file) shift && CONFIG_FILE=$1 ;;
    --config-env) shift && CONFIG_ENV=$1 ;;
    --force-upload) FORCE_UPLOAD=true ;;
    --no-delete-rollback-complete) DELETE_ON_FAILED_CREATION=false ;;
    *) echo "Unknown option '$1'" && exit 1 ;;
  esac
  shift
done

$DEPLOY && ! "$BASE_DIR"/aws.sh check-current-account "${ACCOUNT:-}" 2> /dev/null &&
  echo "Authenticate to${ACCOUNT:+" the '$ACCOUNT' account in"} AWS before deploying the stack" && exit 1

[[ $TEMPLATE ]] && ! [[ -f $TEMPLATE ]] && echo "File '$TEMPLATE' does not exist" && exit 1
${SKIP_BUILD:-false} && BUILD=false

if $DEPLOY; then
  [[ -f samconfig.toml || -f $CONFIG_FILE ]] && CONFIG=true

  if [[ $STACK_NAME || $CONFIG || $GUIDED ]]; then
    TAGS+=(sse:application=self-service sse:deployment-source=manual)
    : "${S3_PREFIX:=$STACK_NAME}"

    echo "Deploying${STACK_NAME:+" stack '$STACK_NAME'"}${TEMPLATE:+" from template '$TEMPLATE'"}"
    [[ $S3_PREFIX ]] && echo "  with S3 prefix '$S3_PREFIX'"
    [[ ${TAGS[*]} ]] && echo "  with tags '${TAGS[*]}'"
    [[ ${PARAMS[*]} ]] && echo "  with params '${PARAMS[*]}'"
  else
    echo "𝙭 Stack name not provided - not deploying (use the --stack-name|-n or --guided option)" && DEPLOY=false
  fi
fi

if $BUILD || ${VALIDATE:-false}; then
  echo "Validating template..."
  sam validate ${TEMPLATE:+--template "$TEMPLATE"}
  sam validate ${TEMPLATE:+--template "$TEMPLATE"} --lint
fi

if $BUILD; then
  echo "Building${TEMPLATE:+" template '$TEMPLATE'"}..."
  sam build \
    ${TEMPLATE:+--template $TEMPLATE} \
    ${SAM_BASE_DIR:+--base-dir $SAM_BASE_DIR} \
    ${PARALLEL:+--parallel} \
    ${CACHED:+--cached}
fi

$DEPLOY || exit 0
$BUILD || [[ -e .aws-sam/build/template.yaml ]] && unset TEMPLATE
${NO_CONFIRM:-false} && CONFIRM_OPTION="--no-confirm-changeset"
${DISABLE_ROLLBACK:-false} && DISABLE_ROLLBACK_OPTION="--disable-rollback"

[[ $(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --query "Stacks[].StackStatus" \
  --output text 2> /dev/null) == ROLLBACK_COMPLETE ]] && ${DELETE_ON_FAILED_CREATION:-true} &&
  sam delete --no-prompts --region "${AWS_REGION:-${AWS_DEFAULT_REGION}}" --stack-name "$STACK_NAME"

sam deploy \
  ${STACK_NAME:+--stack-name "$STACK_NAME"} \
  ${S3_PREFIX:+--s3-prefix "$S3_PREFIX"} \
  ${CONFIG:---resolve-s3} \
  ${DISABLE_ROLLBACK_OPTION:---no-disable-rollback} \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM CAPABILITY_AUTO_EXPAND \
  ${CONFIRM_OPTION:---confirm-changeset} \
  ${TEMPLATE:+--template "$TEMPLATE"} \
  ${FORCE_UPLOAD:+--force-upload} \
  ${TAGS:+--tags "${TAGS[@]}"} \
  ${PARAMS:+--parameter-overrides "${PARAMS[@]}"} \
  ${CONFIG_FILE:+--config-file "$CONFIG_FILE"} \
  ${CONFIG_ENV:+--config-env "$CONFIG_ENV"} \
  ${GUIDED:+--guided}
