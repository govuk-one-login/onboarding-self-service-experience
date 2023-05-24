#!/usr/bin/env bash
# Set up the GitHub repo to work with secure pipelines
cd "$(dirname "${BASH_SOURCE[0]}")"
set -eu

echo The current template is
gh api "/repos/{owner}/{repo}/actions/oidc/customization/sub"

echo

echo Applying new template...
gh api "/repos/{owner}/{repo}/actions/oidc/customization/sub" --method PUT --input github-subject-claim-template.json > /dev/null
gh api "/repos/{owner}/{repo}/actions/oidc/customization/sub"
