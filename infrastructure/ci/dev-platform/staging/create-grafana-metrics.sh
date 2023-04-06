#!/bin/bash

set -eu

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null
../shared/create-grafana-metrics.sh staging
popd > /dev/null
