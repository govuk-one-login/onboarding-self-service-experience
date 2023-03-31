#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../shared/create-api-gateway-logging-stack.sh development
popd > /dev/null
