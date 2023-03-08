#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../shared/create-slack-stack.sh build "T8GT9416G" "C04QFSGKCGG" "${1:-}"
popd > /dev/null
