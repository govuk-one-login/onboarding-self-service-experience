#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

if ! [[ ${ACCOUNT:=${1:-}} ]]; then
  echo "Specify environment ($(../check-aws-account.sh --print-accounts))"
  exit 1
fi

../deploy-sam-stack.sh "${@:2}" \
  --account "$ACCOUNT" \
  --stack-name "$ACCOUNT"-hosted-zone \
  --template "$ACCOUNT"-domains.yml \
  --tags StackType=DNS

popd > /dev/null
