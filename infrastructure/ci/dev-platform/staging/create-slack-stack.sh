#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../shared/create-slack-stack.sh staging "T8GT9416G" "C04QFSGKCGG"
popd > /dev/null
