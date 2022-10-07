import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { join } from 'path';

import { API_HANDLERS_FOLDER } from 'constants/handlerPaths';
import { getRelativeHandlerFileFromPath } from 'helpers/handlerImport';
import {
  getAPIHandlersFolder,
  getNextAPIHandlers,
  getNextChunkFolder,
  getWebpackApiRuntimeFile,
} from 'helpers/nextImport';

const API_HANDLER_NAME = 'NextJSApi';

export const prepareApiHandler = (nextAppRoot: string, scope: Construct): NodejsFunction => {
  const apiHandlerFolder = join(__dirname, '../../handlers/api');

  const nextApiHandlers = getNextAPIHandlers(nextAppRoot);

  return new NodejsFunction(scope, API_HANDLER_NAME, {
    entry: join(apiHandlerFolder, 'index.js'),
    logRetention: RetentionDays.ONE_DAY,
    bundling: {
      externalModules: Object.values(nextApiHandlers)
        .map(path => path.replace(/^pages\/api\//, ''))
        .map(getRelativeHandlerFileFromPath),
      commandHooks: {
        beforeInstall: () => [],
        afterBundling: () => [],
        beforeBundling: (_inputDir, outputDir) => {
          return [
            `mkdir -p ${join(outputDir, API_HANDLERS_FOLDER)}`,
            `cp -r ${getNextChunkFolder(nextAppRoot)} ${join(outputDir, '/chunks')}`,
            `cp -r ${getAPIHandlersFolder(nextAppRoot)} ${join(outputDir, API_HANDLERS_FOLDER)}`,
            `cp ${getWebpackApiRuntimeFile(nextAppRoot)} ${outputDir}`,
          ];
        },
      },
    },
  });
};
