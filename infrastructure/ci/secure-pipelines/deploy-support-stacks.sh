#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

function check-grafana-secret {
  if ! aws secretsmanager describe-secret --secret-id "$GRAFANA_SECRET_NAME" &> /dev/null; then
    echo "Grafana API key secret with the name '$GRAFANA_SECRET_NAME' does not exist in Secret Manager"
    while [[ -z ${grafana_key:-} ]]; do read -rp "Enter the value for the initial grafana API key: " grafana_key; done

    if ! aws secretsmanager create-secret --name "$GRAFANA_SECRET_NAME" --secret-string "$(xargs <<< "$grafana_key")"; then
      echo "Couldn't create secret"
      return 1
    fi
  fi
}

ACCOUNT=$(../../aws.sh get-current-account-name)
DOWNSTREAM_ACCOUNTS=$(../../aws.sh get-downstream-accounts "$ACCOUNT")
[[ $ACCOUNT =~ ^development|production$ ]] && ENV_TYPE=$ACCOUNT

GRAFANA_SECRET_NAME=/self-service/secure-pipelines/grafana-api-key
check-grafana-secret

../../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name secure-pipelines-support \
  --template deployment-support.template.yml \
  --tags Product="GOV.UK One Login" System="Dev Platform" Service="ci/cd" Owner="Self-Service Team" Environment="$ACCOUNT" \
  --parameters EnvironmentType="${ENV_TYPE:-test}" DownstreamAccounts="${DOWNSTREAM_ACCOUNTS:-''}" \
  GrafanaKeySecretName="$GRAFANA_SECRET_NAME"

./configure-github-repo.sh update-deployment-environment
