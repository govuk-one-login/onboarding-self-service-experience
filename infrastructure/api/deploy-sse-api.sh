#!/usr/bin/env bash
set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

../deploy-sam-stack.sh "$@" \
  --account development \
  --build \
  --template sse-api.yml \
  --base-dir ../.. \
  --tags StackType=Dev Component=API

popd > /dev/null
