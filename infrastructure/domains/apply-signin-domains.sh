#!/usr/bin/env bash
set -eu

case ${1:-} in
development | staging | integration | production)
  ACCOUNT=$1
  shift
  ;;
*)
  echo "Specify environment (development | staging | integration | production)"
  exit 1
  ;;
esac

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

../deploy-sam-stack.sh "$@" \
  --stack-name "$ACCOUNT"-hosted-zone \
  --template "$ACCOUNT"-domains.yml \
  --tags StackType=DNS

popd > /dev/null
