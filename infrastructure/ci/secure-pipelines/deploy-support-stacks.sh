#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

ACCOUNT=$(../../aws.sh get-current-account-name)
[[ $ACCOUNT =~ ^development|production$ ]] && ENV_TYPE=$ACCOUNT
../../aws.sh is-initial-account "$ACCOUNT" && INITIAL_ACCOUNT=true &&
  DOWNSTREAM_ACCOUNTS=$(../../aws.sh get-downstream-accounts "$ACCOUNT")

GRAFANA_SECRET_NAME=/self-service/secure-pipelines/grafana-api-key
../configure-deployment-parameters.sh check-secret $GRAFANA_SECRET_NAME
../configure-deployment-parameters.sh check-parameter /self-service/secure-pipelines/developer-notification-email

../../deploy-sam-stack.sh "$@" \
  --validate \
  --stack-name secure-pipelines-support \
  --template deployment-support.template.yml \
  --tags Product="GOV.UK One Login" System="Dev Platform" Service="ci/cd" Owner="Self-Service Team" Environment="$ACCOUNT" \
  --parameters InitialAccount=${INITIAL_ACCOUNT:-false} EnvironmentType="${ENV_TYPE:-test}" \
  DownstreamAccounts="${DOWNSTREAM_ACCOUNTS:-''}" GrafanaKeySecretName="$GRAFANA_SECRET_NAME"

./configure-github-repo.sh update-deployment-environment
