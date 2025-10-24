#!/bin/bash

set -uo pipefail

cat << EOF
This script runs internal integration tests for the Product Pages application.

Requirements:
  - All stack outputs available in environment variables named: \$CFN_<OutputKey>
  - The reports directory available in environment variable:    \$TEST_REPORT_ABSOLUTE_DIR
  - The test report dir is located at the root of the container

aws-cli version: $(aws --version)
node version: $(node --version)

EOF

export HOST=${CFN_AdminToolURL:-} # Set the variable for the endpoint
export ENVIRONMENT=${TEST_ENVIRONMENT:-}

cd /app || exit

printf "Running heartbeat check against %s...\n" "$HOST"

# shellcheck disable=SC2154
status_code="$(curl --location --output /dev/null --write-out '%{http_code}\n' "$HOST")"
if [[ $status_code != "200" ]]; then
  exit 1
fi
printf "Endpoint ok\n"

printf "Running e2e tests against %s...\n" "$HOST"
exit_code=0

if [[ $ENVIRONMENT =~ local ]] || [[ $ENVIRONMENT =~ build ]]; then
  npm run acceptance-tests
  exit_code=$?

  [[ -d "$TEST_REPORT_ABSOLUTE_DIR" ]] && cp -rn ./reports "$TEST_REPORT_ABSOLUTE_DIR"
fi

exit $exit_code
