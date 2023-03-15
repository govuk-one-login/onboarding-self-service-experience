#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../shared/create-ecr-stack.sh development "sse-frontend-pipeline" "${1:-}"
popd > /dev/null
