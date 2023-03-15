#!/usr/bin/env bash
set -eu

echo Creating stack for Slack Notification

if [[ "$#" -ne 3 || ! "development  build  staging  integration production" =~ ( |^)$1( |$) ]]; then
  echo "Usage: $0 <development | build | staging | integration | production> <slack-workspace-id> <slack-channel-id>"
  exit 1
fi

BASE_DIR="$(dirname "${BASH_SOURCE[0]}")"
pushd "$BASE_DIR" > /dev/null

ACCOUNT="$1"
SLACK_WORKSPCE_ID=$2
SLACK_CHANNEL_ID=$3

../../../check-aws-account.sh "$ACCOUNT" || exit

aws cloudformation create-stack --stack-name sse-slack-notify \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/build-notifications/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND --parameters ParameterKey=SlackChannelId,ParameterValue="$SLACK_CHANNEL_ID" \
  ParameterKey=SlackWorkspaceId, ParameterValue="$SLACK_WORKSPCE_ID" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="$ACCOUNT" \
  Key=Owner,Value="DI self-service team"
  