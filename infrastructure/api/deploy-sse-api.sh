#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

[[ $(aws sts get-caller-identity --query "Arn" 2> /dev/null) =~ assumed-role\/([a-zA-z.]+) ]] && user_name=${BASH_REMATCH[1]}

../deploy-sam-stack.sh "$@" \
  --build \
  --base-dir ../.. \
  --account development \
  --template sse-api.yml \
  --tags sse:component=api sse:stack-type=dev sse:stack-role=application sse:owner="${user_name:-}" \
  --params LogGroupNamePrefix=/self-service/dev

popd > /dev/null
