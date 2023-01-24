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

"$BASE_DIR"/../apply-sam-template.sh "$@" \
  --stack-name "$ACCOUNT"-hosted-zone \
  --template "$BASE_DIR"/"$ACCOUNT"-domains.yml \
  --tags DeploymentSource=Manual StackType=DNS
