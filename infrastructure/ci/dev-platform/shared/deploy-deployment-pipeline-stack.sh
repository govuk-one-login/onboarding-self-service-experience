#!/bin/bash

set -eu

function delete_parameter_files() {
  if [[ ! "${DESTINATION_FOR_RETRIEVED_PARAMETERS:-}" == "" && -d "${DESTINATION_FOR_RETRIEVED_PARAMETERS:-}" ]]; then
    echo "Deleting ${DESTINATION_FOR_RETRIEVED_PARAMETERS:-}"
    rm -fr "${DESTINATION_FOR_RETRIEVED_PARAMETERS:-}"
  fi
  if [[ ! "${DIRECTORY_FOR_TAGS:-}" == "" && -f "${DIRECTORY_FOR_TAGS:-}/tags.json" ]]; then
    echo "Deleting ${DIRECTORY_FOR_TAGS:-}/tags.json"
    rm "${DIRECTORY_FOR_TAGS:-}/tags.json"
  fi
}

function retrieve_from_parameter_store() {
  aws ssm get-parameter --name "/self-service/devplatform/$1/$2" --output json | jq '.Parameter.Value | fromjson'
}

USAGE="Usage: $0 <development | build | staging | integration | production> <stack-name> <directory containing provisioner.sh>"

if [[ "$#" -ne 3 || ! "development  build  staging  integration production" =~ ( |^)$1( |$) ]]; then
  echo "$USAGE"
  echo "Where provisioner.sh is di-devplatform-deploy/stack-orchestration-tool/provisioner.sh"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

SHORT_ACCOUNT="$1"
STACK_NAME="$2"
DIRECTORY_FOR_SCRIPT="$3"

../../../check-aws-account.sh "$SHORT_ACCOUNT" || exit

if [[ ! -f "$DIRECTORY_FOR_SCRIPT/provisioner.sh" ]]; then
  echo "$DIRECTORY_FOR_SCRIPT/provisioner.sh not found"
  exit 1
fi

if [[ ! "$SHORT_ACCOUNT" == "development" ]]; then
  AWS_ACCOUNT="di-onboarding-$SHORT_ACCOUNT-admin"
else
  AWS_ACCOUNT="di-onboarding-$SHORT_ACCOUNT"
fi

if [[ ! -d "${DIRECTORY_FOR_SCRIPT}/configuration/${AWS_ACCOUNT}/${STACK_NAME}" ]]; then
  mkdir -p "${DIRECTORY_FOR_SCRIPT}/configuration/${AWS_ACCOUNT}/${STACK_NAME}"
fi

DESTINATION_FOR_RETRIEVED_PARAMETERS="$(realpath "${DIRECTORY_FOR_SCRIPT}/configuration/${AWS_ACCOUNT}/${STACK_NAME}")"
DIRECTORY_FOR_TAGS="$(realpath "${DIRECTORY_FOR_SCRIPT}/configuration/${AWS_ACCOUNT}")"

if [[ ! -d "$DESTINATION_FOR_RETRIEVED_PARAMETERS" ]]; then
  mkdir -p "$DESTINATION_FOR_RETRIEVED_PARAMETERS"
fi

trap delete_parameter_files SIGINT EXIT

echo "Retrieving parameters from parameter store."
retrieve_from_parameter_store "$STACK_NAME" tags > "${DIRECTORY_FOR_TAGS:-}/tags.json"
retrieve_from_parameter_store "$STACK_NAME" parameters > "${DESTINATION_FOR_RETRIEVED_PARAMETERS}/parameters.json"

pushd "$DIRECTORY_FOR_SCRIPT" > /dev/null

echo "Running AUTO_APPLY_CHANGESET=true ./provisioner.sh ""${AWS_ACCOUNT}"" ""${STACK_NAME}"" sam-deploy-pipeline LATEST"

AUTO_APPLY_CHANGESET=true ./provisioner.sh "${AWS_ACCOUNT}" "${STACK_NAME}" sam-deploy-pipeline LATEST

popd > /dev/null
popd > /dev/null
