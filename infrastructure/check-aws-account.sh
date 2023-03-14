#!/usr/bin/env bash
#Check you're in the correct AWS account
set -eu

declare -A accounts=(
  [399055180839]=build
  [494650018671]=development
  [325730373996]=staging
  [663985455444]=integration
  [389946456390]=production
)

account_names=$(IFS="|" && echo "${accounts[*]}")
[[ ${1:-} == "--print-accounts" ]] && echo "${account_names//|/ | }" && exit
[[ ${1:-} == "--get-account-name" ]] && info=true && shift || info=false

target_account="${1:-}"
if ! actual_account_number=$(aws sts get-caller-identity --query "Account" --output text 2> /dev/null); then
  echo "Valid AWS credentials were not found in the environment" >&2
  echo "Authenticate to${target_account:+" the '$target_account' account in"} AWS and try again" >&2
  exit 255
fi

actual_account=${accounts[$actual_account_number]:-}
[[ $actual_account ]] || (echo "Unknown account number: $actual_account_number" >&2 && exit 1)

if ! [[ $target_account ]]; then
  $info && echo "$actual_account" || echo "» You're in the '$actual_account' account"
  exit
fi

account_regex="\|?$target_account\|?"
[[ $account_names =~ $account_regex ]] || (echo "Invalid account: '$target_account'" >&2 && exit 1)

if ! [[ $actual_account == "$target_account" ]]; then
  echo "You should be in '$target_account' but you're in '$actual_account'"
  echo "Authenticate to the '$target_account' account and try again" >&2
  exit 1
fi

echo "✔ You're in the '$target_account' account"
