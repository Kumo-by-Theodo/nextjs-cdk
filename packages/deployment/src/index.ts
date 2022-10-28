import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DefaultStackSynthesizer } from 'aws-cdk-lib';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { exit } from 'process';

import NextEdgeStack from './cdkConstruct/edge';
import NextNormalStack from './cdkConstruct/normal';

const DEFAULT_STACK_NAME = 'NextJSStack';

type createNextStackOptions = {
  stackName?: string;
  deployAtEdge?: boolean;
};

export const createNextStack = (
  app: cdk.App,
  nextAppRoot: string,
  { deployAtEdge = true, stackName = DEFAULT_STACK_NAME }: createNextStackOptions,
): void => {
  if (!existsSync(join(nextAppRoot, 'next.config.js'))) {
    console.error('next.config.js file not found... Aborting deploy');
    exit(1);
  }

  try {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const nextConfig = require(join(nextAppRoot, 'next.config.js'));
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (nextConfig.target !== undefined) {
      console.error('Please unset any next target in your `next.config.js`');
      exit(1);
    }
  } catch (e) {
    console.error('Something went wrong trying to load next.config.js');
    exit(1);
  }

  exec(
    `${join(nextAppRoot, '../node_modules/.bin/next')} build ${nextAppRoot}`,
    (error, stdout) => {
      if (error) {
        console.error('Something went wrong building your next app... Aborting deploy');
        console.debug(error);
        exit(1);
      } else {
        console.info('Next build completed');
        console.debug(stdout);

        if (deployAtEdge)
          new NextEdgeStack(app, stackName, nextAppRoot, {
            env: {
              region: 'us-east-1',
            },
            synthesizer: new DefaultStackSynthesizer({
              qualifier: process.env.NEXT_STACK_QUALIFIER,
            }),
          });
        else
          new NextNormalStack(app, stackName, nextAppRoot, {
            env: {
              region: 'us-east-1',
            },
            synthesizer: new DefaultStackSynthesizer({
              qualifier: process.env.NEXT_STACK_QUALIFIER,
            }),
          });
      }
    },
  );
};
