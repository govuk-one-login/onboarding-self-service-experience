#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"

"$BASE_DIR"/../deploy-sam-stack.sh "$@" \
  --account development \
  --stack-name sse-frontend-infrastructure \
  --template "$BASE_DIR"/sse-frontend-infrastructure.yml \
  --tags StackType=FrontendInfrastructure
