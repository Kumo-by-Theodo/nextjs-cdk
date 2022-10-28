import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { join } from 'path';

import { DEPENDENCY_FOLDER, RUNTIME_SETTINGS_FILE } from 'constants/paths/handlerPaths';
import { createRuntimeSettingsFile } from 'helpers/createRuntimeSettingsFile';
import {
  getAPIHandlersFolder,
  getNextAPITracedPackages,
  getNextChunkFolder,
  getWebpackApiRuntimeFile,
} from 'helpers/nextImport';
import { createAPIRuntimeSettings } from 'runtimeSettings/api';

const API_HANDLER_NAME = 'NextJSApi';

export const getApiLambda = (nextAppRoot: string, scope: Construct): NodejsFunction => {
  const apiHandlerFolder = join(__dirname, '../../../handlers/normal/api');
  const runtimeData = createAPIRuntimeSettings(nextAppRoot);

  const packages = getNextAPITracedPackages(nextAppRoot);

  return new NodejsFunction(scope, API_HANDLER_NAME, {
    entry: join(apiHandlerFolder, 'index.js'),
    logRetention: RetentionDays.ONE_DAY,
    bundling: {
      externalModules: [RUNTIME_SETTINGS_FILE],
      nodeModules: packages,
      commandHooks: {
        beforeInstall: () => [],
        afterBundling: () => [],
        beforeBundling: (_inputDir, outputDir) => {
          const temporaryFile = createRuntimeSettingsFile(runtimeData);

          return [
            `mv ${temporaryFile} ${outputDir}`,
            `mkdir -p ${join(outputDir, DEPENDENCY_FOLDER)}`,
            `cp -r ${getAPIHandlersFolder(nextAppRoot)} ${join(outputDir, DEPENDENCY_FOLDER)}`,
            `cp -r ${getNextChunkFolder(nextAppRoot)} ${join(outputDir, '/chunks')}`,
            `cp ${getWebpackApiRuntimeFile(nextAppRoot)} ${outputDir}`,
          ];
        },
      },
    },
  });
};
