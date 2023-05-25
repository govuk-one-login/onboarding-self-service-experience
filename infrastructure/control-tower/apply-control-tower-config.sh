#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name control-tower \
  --template control-tower.template.yml \
  --tags sse:stack-type=config sse:stack-role=account-management
