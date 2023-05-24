#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

function check-grafana-secret {
  local secret_name=$1

  if ! aws secretsmanager describe-secret --secret-id "$secret_name" &> /dev/null; then
    echo "Grafana API key secret with the name '$secret_name' does not exist in Secret Manager"
    while [[ -z ${grafana_key:-} ]]; do read -rp "Enter the value for the initial grafana API key: " grafana_key; done

    if ! aws secretsmanager create-secret --name "$secret_name" --secret-string "$grafana_key"; then
      echo "Couldn't create secret"
      return 1
    fi
  fi
}

ACCOUNT=$(../../aws.sh get-current-account-name)
DOWNSTREAM_ACCOUNTS=$(../../aws.sh get-downstream-accounts "$ACCOUNT")
[[ $ACCOUNT == "production" ]] && ENV_TYPE="production"

GRAFANA_SECRET=secure-pipelines-grafana-api-key
check-grafana-secret $GRAFANA_SECRET

../../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name deployment-support \
  --template deployment-support.template.yml \
  --tags Product="GOV.UK One Login" System="Dev Platform" Service="ci/cd" Owner="Self-Service Team" Environment="$ACCOUNT" \
  --parameters EnvironmentType=${ENV_TYPE:-test} DownstreamAccounts="${DOWNSTREAM_ACCOUNTS:-''}" \
  GrafanaKeySecretName=$GRAFANA_SECRET
