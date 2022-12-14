import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { DefaultStackSynthesizer } from 'aws-cdk-lib';
import { exec } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { exit } from 'process';

import { NextJSStack } from './cdkConstruct/nextjs-stack';

const STACK_NAME = 'NextJSStack';

export const createNextStack = (app: cdk.App, nextAppRoot: string): void => {
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

        new NextJSStack(app, STACK_NAME, nextAppRoot, {
          env: {
            region: 'us-east-1',
          },
          synthesizer: new DefaultStackSynthesizer({ qualifier: process.env.NEXT_STACK_QUALIFIER }),
        });
      }
    },
  );
};
