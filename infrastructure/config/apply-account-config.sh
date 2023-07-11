#!/usr/bin/env bash
# Apply infrastructure config to an AWS account
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu -o pipefail

function deploy-config-stack {
  local type=$1

  ../deploy-sam-stack.sh "${@:2}" \
    --validate \
    --stack-name "$type"-config \
    --template "$type".template.yml \
    --tags sse:stack-type=config
}

function control-tower {
  deploy-config-stack control-tower --tags sse:stack-role=account-management "$@"
}

function network {
  deploy-config-stack network --tags sse:stack-role=vpc "$@"
}

function domain {
  local account servers params

  if [[ $(../aws.sh get-current-account-name) == production ]]; then
    echo "Getting subdomain name servers..."
    for account in development build staging integration; do
      servers=$(gds aws di-onboarding-$account -- ../aws.sh get-stack-outputs domain-config HostedZoneNameServers) || continue
      params+=("${account@u}NameServers=$(jq --raw-output ".value" <<< "$servers")")
    done
  fi

  deploy-config-stack domain --tags sse:stack-role=dns ${params:+--parameters ${params[@]}} "$@"
}

"$@"
