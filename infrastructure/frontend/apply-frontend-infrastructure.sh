#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"

"$BASE_DIR"/../deploy-sam-stack.sh "$@" \
  --validate \
  --account development \
  --stack-name self-service-frontend-infrastructure \
  --template "$BASE_DIR"/sse-frontend-infrastructure.yml \
  --tags StackType=FrontendInfrastructure
