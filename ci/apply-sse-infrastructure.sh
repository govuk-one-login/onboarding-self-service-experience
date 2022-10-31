#!/usr/bin/env bash
set -e

while [[ -n $1 ]]; do
  case $1 in
  -y | --no-confirm)
    NO_CONFIRM=true
    ;;
  *)
    echo "Unknown option '$1'"
    exit 1
    ;;
  esac
  shift
done

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"

"$BASE_DIR"/apply-sam-template.sh \
  ${NO_CONFIRM:+--no-confirm} \
  --stack-name sse-infrastructure \
  --template "$BASE_DIR"/sse-infrastructure.yml \
  --tags DeploymentSource=Manual StackType=Infrastructure
