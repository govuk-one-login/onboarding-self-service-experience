#!/usr/bin/env bash
# Empty secure pipeline buckets so they can be deleted
cd "$(dirname "${BASH_SOURCE[0]}")"
STEP=1000
set -eu

function get-objects {
  local bucket=$1 object_type=${2:-Versions} objects
  objects=$(aws s3api list-object-versions --bucket "$bucket" --query "${object_type}[].{Key:Key,VersionId:VersionId}")
  [[ $objects != null ]] && echo "$objects"
}

function delete-objects {
  local objects num lower=0 upper=0
  objects=$(get-objects "$@") || return 0
  num=$(jq length <<< "$objects") && echo -n "[$num ${2:-Objects}] "

  while [[ $upper -lt $num ]]; do
    local upper=$((upper + STEP)) && echo -n "[$lower:$upper] "
    aws s3api delete-objects --bucket "$1" --delete "$(jq "{Objects: .[$lower:$upper], Quiet: true}" <<< "$objects")"
    lower=$upper
  done
}

function list-buckets {
  aws s3 ls | cut -d ' ' -f 3 | grep "^secure-pipelines-${1:-}"
}

function empty-bucket {
  delete-objects "$1" && delete-objects "$1" DeleteMarkers
}

../../aws.sh check-current-account
[[ $* ]] || { list-buckets && exit; }
[[ $1 == all ]] || suffix=$1
[[ ${2:-} == loop ]] && loop=true

while true; do
  buckets=$(list-buckets "${suffix:-}") || { echo "No '$1' buckets found" && exit; }
  num_buckets=$(wc -l <<< "$buckets" | xargs)

  idx=1
  for bucket in $buckets; do
    echo -n "[$((idx++))/$num_buckets] Bucket '$bucket' "
    empty-bucket "$bucket" && echo "is empty" || echo "failed to empty"
  done

  ${loop:-false} || break
done
