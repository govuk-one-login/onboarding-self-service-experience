# Developer stacks

### TL;DR

Run `npm run deploy` to deploy and `npm run remote` to run a local frontend, or `npm run deploy admin-tool` to do it
one command.

## Deploying

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

### Passing SAM options

Attach additional options to pass to the [SAM build/deploy script](../deploy-sam-stack.sh)

```shell
./deploy.sh [component] [prefix] --cached --parallel --no-confirm
```

When invoking with `npm` and passing options, the parameters need to be preceded by the `--` separator

```shell
npm run deploy [component] [prefix] -- [options]
```

You most likely should always use `-c -p -y` for fast builds and deploys.

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

## Listing and deleting stacks

List all deployed stacks with the given or default prefix

```shell
npm run list [prefix]
```

Delete all stacks with the given or default prefix

```shell
npm run delete [prefix]
```

Delete the specified component stacks with the given prefix

```shell
npm run delete prefix [components...]
```
