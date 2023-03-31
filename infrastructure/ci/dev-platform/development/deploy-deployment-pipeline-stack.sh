#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../shared/deploy-deployment-pipeline-stack.sh development "${1:-}" "${2:-}"
popd > /dev/null
