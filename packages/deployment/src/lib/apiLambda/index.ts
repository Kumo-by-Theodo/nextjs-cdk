import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { join } from 'path';

import { DEPENDENCY_FOLDER, RUNTIME_SETTINGS_FILE } from 'constants/handlerPaths';
import {
  getAPIHandlersFolder,
  getNextChunkFolder,
  getWebpackApiRuntimeFile,
} from 'helpers/nextImport';
import { createFileInTempDir } from 'runtimeSettings';
import { createAPIRuntimeSettings } from 'runtimeSettings/api';

const API_HANDLER_NAME = 'NextJSApi';

export const prepareApiHandler = (nextAppRoot: string, scope: Construct): NodejsFunction => {
  const apiHandlerFolder = join(__dirname, '../../handlers/api');
  const runtimeData = createAPIRuntimeSettings(nextAppRoot);

  return new NodejsFunction(scope, API_HANDLER_NAME, {
    entry: join(apiHandlerFolder, 'index.js'),
    logRetention: RetentionDays.ONE_DAY,
    bundling: {
      externalModules: [RUNTIME_SETTINGS_FILE, './runtime/api/hello.js'],
      commandHooks: {
        beforeInstall: () => [],
        afterBundling: () => [],
        beforeBundling: (_inputDir, outputDir) => {
          const tmp_file = createFileInTempDir(runtimeData);

          return [
            `mv ${tmp_file} ${outputDir}`,
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
