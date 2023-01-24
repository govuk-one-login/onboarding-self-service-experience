#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"

"$BASE_DIR"/../apply-sam-template.sh "$@" \
  --stack-name sse-frontend-infrastructure \
  --template "$BASE_DIR"/sse-frontend-infrastructure.yml \
  --tags DeploymentSource=Manual StackType=FrontendInfrastructure
