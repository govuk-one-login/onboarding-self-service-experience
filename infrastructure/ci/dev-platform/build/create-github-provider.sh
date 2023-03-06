#!/usr/bin/env bash
set -eu

echo Creating OIDC provider for github actions in the build account.

aws cloudformation create-stack --stack-name github-identity \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.amazonaws.com/github-identity/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_IAM \
  --parameters ParameterKey=System,ParameterValue="di-onboarding-self-service" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="build" \
  Key=Owner,Value="DI self-service team"
