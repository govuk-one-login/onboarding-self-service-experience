#!/usr/bin/env bash
# AWS account utils for deploying stacks
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

function get-all-accounts {
  jq flatten aws-accounts.json
}

function get-account-group {
  jq --arg name "$1" 'with_entries(select(.value | contains([{name: $name}]))) | flatten' aws-accounts.json
}

function get-account-number {
  jq --exit-status --arg name "$1" '.[] | select(.name == $name) | .number' < <(get-all-accounts)
}

function get-initial-account {
  jq --raw-output '.[0] | .name' < <(get-account-group "$1")
}

function is-initial-account {
  local name=${1:-$(get-current-account-name)}
  [[ $name == $(get-initial-account "$name") ]]
  echo "$name"
}

function get-next-account {
  get-higher-accounts-in-group "$1" 1
}

function get-previous-account-name {
  local name=$1 accounts
  accounts=$(get-account-group "$name")
  idx=$(get-account-index-in-group "$accounts" "$name") || return 0
  jq --raw-output --exit-status ".[$((idx - 1)):$idx] | map(.name) | .[]" <<< "$accounts" || return 0
}

function get-downstream-accounts {
  local name=$1 accounts
  [[ $name == $(get-initial-account "$name") ]] || return 0
  accounts=$(get-higher-accounts-in-group "$name")
  echo "${accounts:=$(get-account-number "$name")}"
}

function get-account-index-in-group {
  jq --exit-status --arg name "$2" 'map(.name == $name) | index(true)' <<< "$1"
}

function get-higher-accounts-in-group {
  local accounts numbers idx name=$1 num=${2:-}
  accounts=$(get-account-group "$name")
  idx=$(get-account-index-in-group "$accounts" "$name") || return 0

  start=$((idx + 1))
  [[ $num ]] && end=$(("$start" + "$num"))
  downstream_accounts=$(jq --exit-status ".[$start:${end:-}] | map(.number) | .[]" <<< "$accounts") || return 0

  mapfile -t numbers <<< "$downstream_accounts"
  (IFS="," && echo "${numbers[*]}")
}

function get-current-account-name {
  local account_number account
  account_number=$(get-current-account-number "$@") || exit
  account=$(jq --raw-output ".[] | select(.number == $account_number) | .name" < <(get-all-accounts))
  [[ $account ]] && echo "$account" && return
  echo "Unknown account number: $account_number" >&2 && return 1
}

function get-caller-identity {
  aws sts get-caller-identity 2> /dev/null && return

  local target=${1:-}
  echo "Valid AWS credentials were not found in the environment" >&2
  echo "Authenticate to${target:+" the '$target' account in"} AWS and try again" >&2
  return 255
}

function get-current-account-number {
  local identity
  identity=$(get-caller-identity "$@") || exit
  jq --raw-output ".Account" <<< "$identity"
}

function get-user-name {
  [[ $(get-caller-identity "$@" | jq --raw-output ".Arn") =~ assumed-role\/([a-zA-z.]+) ]] && echo "${BASH_REMATCH[1]}"
}

function check-current-account {
  local account target=${1:-}
  account=$(get-current-account-name "$target")

  if [[ $target ]]; then
    if ! jq --exit-status --arg name "$target" '.[] | select(.name == $name)' < <(get-all-accounts) 1> /dev/null; then
      echo "Invalid account: '$target'" >&2
      return 1
    fi

    if ! [[ $account == "$target" ]]; then
      echo "You should be in '$target' but you're in '$account'"
      echo "Authenticate to the '$target' account and try again" >&2
      return 1
    fi
  fi

  echo "» You're in the '$account' account"
}

function get-stack-outputs {
  local stack=$1 selectors=${*:2} selector query outputs

  for selector in $selectors; do
    query+="${query:+ || }contains(OutputKey, '$selector')"
  done

  query=${query:+?${query}}
  outputs=$(aws cloudformation describe-stacks --stack-name "$stack" --query "Stacks[0].Outputs[$query]" 2> /dev/null)
  [[ $outputs != null ]] && [[ $outputs != "[]" ]] && jq 'map({name: .OutputKey, value: .OutputValue}) | .[]' <<< "$outputs"
}

[[ $* ]] || check-current-account "$@"
[[ $* ]] && "$@"
