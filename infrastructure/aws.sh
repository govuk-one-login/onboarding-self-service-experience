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

function print-account-names {
  jq --raw-output 'map(.name) | join(" | ")' < <(get-all-accounts)
}

function get-initial-account {
  jq --raw-output '.[0] | .name' < <(get-account-group "$1")
}

function get-next-account {
  get-downstream-accounts "$1" 1
}

function get-downstream-accounts {
  local accounts numbers idx name=$1 num=${2:-}
  [[ -z $num && $name != $(get-initial-account "$name") ]] && return 0
  accounts=$(get-account-group "$name")

  idx=$(jq --exit-status --arg name "$name" 'map(.name == $name) | index(true)' <<< "$accounts") || return 0

  start=$((idx + 1))
  [[ $num ]] && end=$(("$start" + "$num"))

  mapfile -t numbers < <(jq ".[$start:${end:-}] | map(.number) | .[]" <<< "$accounts")
  (IFS="," && echo "${numbers[*]}")
}

function get-current-account-name {
  local account_number account
  account_number=$(get-current-account-number "$@") || exit $?
  account=$(jq --raw-output ".[] | select(.number == $account_number) | .name" < <(get-all-accounts))
  [[ $account ]] && echo "$account" && return
  echo "Unknown account number: $account_number" >&2 && return 1
}

function get-current-account-number {
  aws sts get-caller-identity --query "Account" --output text 2> /dev/null && return

  local target=${1:-}
  echo "Valid AWS credentials were not found in the environment" >&2
  echo "Authenticate to${target:+" the '$target' account in"} AWS and try again" >&2
  return 255
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

"$@"
