#!/usr/bin/env bash
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

STACK_NAME=deployment-config

../../deploy-sam-stack.sh "$@" \
  --validate \
  --account development \
  --stack-name $STACK_NAME \
  --template deployment-config.template.yml \
  --tags sse:stack-type=config sse:stack-role=deployment
  --params GitHubOrg=govuk-one-login GitHubRepo=onboarding-self-service-experience

../configure-github-repo.sh update-deployment-environment development $STACK_NAME \
  DeploymentRoleARN DeploymentArtifactsBucket FrontendContainerImageRepository
