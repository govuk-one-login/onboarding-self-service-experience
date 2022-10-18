#!/usr/bin/env bash
set -e

OPTION_REGEX="^--?.*"

while [[ -n $1 ]]; do
  case $1 in
  -t | --template)
    shift
    TEMPLATE=$1
    ;;
  -s | --stack-name)
    shift
    STACK_NAME=$1
    ;;
  -p | --prefix)
    shift
    PREFIX=$1
    ;;
  -g | --tags)
    TAGS=()
    while [[ -n $2 ]] && ! [[ $2 =~ $OPTION_REGEX ]]; do
      shift
      TAGS+=("$1")
    done
    ;;
  -o | --params)
    PARAMS=()
    while [[ -n $2 ]] && ! [[ $2 =~ $OPTION_REGEX ]]; do
      shift
      PARAMS+=("$1")
    done
    ;;
  *)
    echo "Unknown option '$1'"
    exit 1
    ;;
  esac
  shift
done

[[ -f $TEMPLATE ]] || (echo "File '$TEMPLATE' does not exist" && exit 1)
[[ -z $STACK_NAME ]] && echo "Stack name not provided" && exit 1
[[ -z $PREFIX ]] && PREFIX=$STACK_NAME

if ! aws sts get-caller-identity > /dev/null; then
  echo "AWS credentials not found in the environment. Authenticate to AWS before running this script."
  exit 1
fi

echo "Deploying stack '$STACK_NAME' from template $TEMPLATE"
echo "  with S3 prefix '$PREFIX'"
[[ ${#TAGS[@]} -gt 0 ]] && echo "  with tags ${TAGS[*]}"
[[ ${#PARAMS[@]} -gt 0 ]] && echo "  with params ${PARAMS[*]}"

sam deploy \
  --stack-name "$STACK_NAME" \
  --template-file "$TEMPLATE" \
  --confirm-changeset \
  --disable-rollback \
  --resolve-s3 \
  --s3-prefix "$PREFIX" \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM \
  ${TAGS:+--tags ${TAGS[@]}} \
  ${PARAMS:+--parameter-overrides ${PARAMS[@]}}
