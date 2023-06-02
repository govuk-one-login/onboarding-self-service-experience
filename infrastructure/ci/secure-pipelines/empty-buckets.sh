#!/usr/bin/env bash
# Empty secure pipeline buckets so they can be deleted
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

function get-objects {
  local bucket=$1 object_type=${2:-Versions} objects
  objects=$(aws s3api list-object-versions --bucket "$bucket" --query "${object_type}[].{Key:Key,VersionId:VersionId}")
  [[ $objects != null ]] && echo "$objects"
}

function delete-objects {
  local objects
  objects=$(get-objects "$@") || return
  aws s3api delete-objects --bucket "$1" --delete \
    "$(jq --null-input --argjson objects "$objects" '{Objects: $objects, Quiet: true}')"
}

function empty-bucket {
  delete-objects "$1" || delete-objects "$1" DeleteMarkers
}

BUCKET_TYPE=${1:-pipeline}

BUCKET_NAME_PREFIX=$(case $BUCKET_TYPE in
  pipeline) echo secure-pipelines ;;
  support) echo secure-pipelines-support ;;
  *) exit 1 ;;
esac)

../../aws.sh check-current-account

buckets=$(aws s3 ls | cut -d ' ' -f 3 | grep "^$BUCKET_NAME_PREFIX") || echo "No $BUCKET_TYPE buckets found"
num_buckets=$(wc -l <<< "$buckets" | xargs)

idx=1
for bucket in $buckets; do
  echo -n "[$((idx++))/$num_buckets] Bucket '$bucket' "
  empty-bucket "$bucket" && echo "has been emptied" || echo "is empty"
done
