# sls-nextjs

## Install

To install the project with [yarn v3](https://yarnpkg.com/getting-started/install), run `yarn install`.

## Example app

Start the example app in development mode

```
cd example-app
yarn dev
```

Start the example app in production mode (local next server)

```
cd example-app
yarn build
yarn start
```

Build the package `deployment`

```
cd packages/deployment
yarn package
```

Deploy the example app in production mode (AWS serverless server)

```
cd example-app
yarn deploy
```

## Contribute
