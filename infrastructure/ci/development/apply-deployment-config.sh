#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

../deploy-sam-stack.sh "$@" \
  --validate \
  --account development \
  --stack-name dev-deployments-config \
  --template deployment-config.template.yml \
  --tags sse:stack-type=config sse:stack-role=deployment
