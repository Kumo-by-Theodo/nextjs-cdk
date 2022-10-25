## How to use nextjs-cdk with workspaces ?

If your next app is part of the workspace you **must** specify in your `next.config.js` the path to the root of your repository. For example :

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    outputFileTracingRoot: '../',
  },
};

module.exports = nextConfig;
```

Otherwise Next's native file tracing won't find needed dependencies.
