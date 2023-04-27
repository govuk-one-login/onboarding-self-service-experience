#!/usr/bin/env bash

set -eu

if [[ "$#" -ne 2 || ! "development  build  staging  integration production" =~ ( |^)$1( |$) ]]; then
  echo "Usage: $0 <development | build | staging | integration | production> <email-domain>"
  exit 1
fi

if [[ "$1" == "production" ]]; then
  ACCOUNT=""
else
  ACCOUNT="${1@u}"
fi

DOMAIN=$2
HOSTED_ZONE="SignInService""${ACCOUNT}""HostedZone"

export DOMAIN
BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

../../infrastructure/check-aws-account.sh

check_domain_verified() {
  echo "Checking that $DOMAIN has been verified"
  STATUS="Pending"
  while [[ $STATUS == "Pending" ]]; do
    STATUS=$(aws ses get-identity-verification-attributes --identities "$DOMAIN" | jq --arg DOMAIN "$DOMAIN" -r '.VerificationAttributes."'"$DOMAIN"'".VerificationStatus')
    echo "$STATUS"
    sleep 5
  done
}

export -f check_domain_verified

sam build --template email-identity-template.yml
sam deploy \
  --no-fail-on-empty-changeset \
  --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
  --resolve-s3 \
  --parameter-overrides "DomainToVerify=$DOMAIN SignInHostedZone=$HOSTED_ZONE" \
  --stack-name sse-email-identity

timeout --foreground 300s bash -c check_domain_verified

popd > /dev/null
