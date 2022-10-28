# sls-nextjs

## Install

To install the project with [yarn v3](https://yarnpkg.com/getting-started/install), run `yarn install`.

## Example app

Start the example app in development mode

```bash
cd example-app
yarn dev
```

Start the example app in production mode (local next server)

```bash
cd example-app
yarn build
yarn start
```

Build the package `deployment`

```bash
cd packages/deployment
yarn package
```

Deploy the example app in production mode (AWS serverless server)

```bash
cd example-app
# For a first deployment only:
yarn bootstrap
# Deploy the app
yarn deploy
```

## Contribute
