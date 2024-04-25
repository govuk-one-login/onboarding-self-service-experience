# Onboarding Feature Deployment

> [!WARNING]
> Pull requests merged to `main` will be released to production, please ensure the checklist below is complete

Before any work can be merged to main in must meet the definition of done and be ready to deploy. While many of these tasks will be automated, the reviewers must take the responsibility of confirming the checklist below has been completed before this ticket can be merged.

## Checklist

-   [ ] this pull request meets the acceptance criteria of the ticket

-   [ ] this branch is up-to-date with the main branch

    `git fetch --all && git rebase origin/main`

-   [ ] tests have been written to cover any new or updated functionality

-   [ ] new configuration parameters have been deployed to all environments, see [configuration management](https://govukverify.atlassian.net/l/cp/N7q3Vh3r).

-   [ ] all external infrastructure dependencies have been updated in all environments

## Changes

[ _please list the changes this pull request is making_ ]

### `Added` for new features

### `Changed` for changes in existing functionality

### `Deprecated` for soon-to-be removed features

### `Removed` for now removed features

### `Fixed` for any bug fixes

### `Security` in case of vulnerabilities
