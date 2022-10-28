import { createNextStack } from '@cdk-sls-nextjs/lib';
import * as cdk from 'aws-cdk-lib';
import { cwd } from 'process';

const app = new cdk.App();

createNextStack(app, cwd(), {
  deployAtEdge: false,
});
