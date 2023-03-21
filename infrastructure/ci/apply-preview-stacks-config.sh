#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"

"$BASE_DIR"/../deploy-sam-stack.sh "$@" \
  --validate \
  --account development \
  --stack-name github-actions-preview-stacks-config \
  --template "$BASE_DIR"/github-actions-preview-stacks.yml \
  --tags sse:stack-type=config sse:stack-role=deployment
