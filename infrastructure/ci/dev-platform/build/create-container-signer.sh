#!/usr/bin/env bash
set -eu

echo Creating stack for signing containers.

aws cloudformation create-stack --stack-name container-signer \
  --template-url https://template-storage-templatebucket-1upzyw6v9cs42.s3.eu-west-2.amazonaws.com/container-signer/template.yaml \
  --region eu-west-2 \
  --capabilities CAPABILITY_IAM \
  --parameters 'ParameterKey=AllowedAccounts,ParameterValue="325730373996,663985455444,389946456390"' \
  ParameterKey=Environment,ParameterValue="build" \
  --tags Key=Product,Value="GOV.UK Sign In" \
  Key=System,Value="Onboarding Self-Service" \
  Key=Environment,Value="build" \
  Key=Owner,Value="DI self-service team"
