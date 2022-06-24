#!/usr/bin/env bash

# basic script for dev use locally because now that we're adding parameters, this command line is long

if ! gds aws di-onboarding-development -- sam validate
then
  osascript -e 'say "Oh no, the template is not valid!"'
  exit
fi
osascript -e 'say "Yipee! The template is actually valid!"'

if ! sam build --beta-features
then
  osascript -e 'say "Oh no, the things could not be built!"'
  exit
fi
osascript -e 'say "Yipee! We managed to build it!"'

if ! gds aws di-onboarding-development -- sam deploy --parameter-overrides "RegisterClientRoleArn=* RegisterCientFunctionName=roger AuthRegistrationBaseUrl=https://oidc.integration.account.gov.uk"
then
  osascript -e 'say "Oh no, it did not deploy!"'
  exit
fi
osascript -e 'say "Yippee. It has deployed successfully.  Go and make a coffee to celebrate, or something"'