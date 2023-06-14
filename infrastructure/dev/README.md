# Developer stacks

## Deploying

Authenticate to AWS before deploying. The script checks that AWS credentials are present in the environment and the
session is not expired. You may use the [gds-cli](https://github.com/alphagov/gds-cli) or any other method to set
the necessary environment variables.

Deploy a backend component (e.g. `api`) with the default username prefix

```shell
./deploy.sh api
```

Deploy a backend component with a prefix of your choice; your name is probably a sensible choice. The prefix must not
end with a `-`.

```shell
./deploy.sh [component] [prefix]
```

Invoke the script using `npm` from any directory - no need to sail around the repo to locate the script

```shell
npm run deploy [component] [prefix]
```

Deploy the full stack set

```shell
npm run deploy [prefix]
```

## Running a local frontend against deployed backend stacks

The script gets the export values from AWS based on the supplied prefix, and sets the environment variables before
running the frontend. The default username prefix is used if no prefix is provided.

Run the frontend against a deployed backend stack set

```shell
npm run aws [prefix]
```

or

```shell
npm run remote [prefix]
```

Deploy and run

```shell
npm run deploy admin-tool [prefix]
```

## Passing SAM options

Attach additional options to pass to the [SAM build/deploy script](../deploy-sam-stack.sh)

```shell
./deploy.sh api [prefix] --cached --parallel --no-confirm
```

When invoking with `npm` and passing options, the parameters need to be preceded by the `--` separator

```shell
npm run deploy -- [component] [prefix] [options]
```
