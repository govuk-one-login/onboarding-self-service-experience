#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../shared/create-ecr-stack.sh build sse-frontend-deployer
popd > /dev/null
