import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { existsSync, readdirSync } from 'fs';
import { join } from 'path';

import { NEXT_PUBLIC_FOLDER, RUNTIME_SETTINGS_FILE } from 'constants/paths';
import { createRuntimeSettingsFile } from 'helpers/createRuntimeSettingsFile';
import {
  requirePageManifest,
  requirePreRenderManifest,
  requireRoutesManifest,
} from 'helpers/nextImport';
import { createDefaultRuntimeSettings } from 'runtimeSettings/default';

const DEFAULT_LAMBDA_NAME = 'NextJSDefault';

export const getDefaultLambda = (nextAppRoot: string, scope: Construct): NodejsFunction => {
  const defaultHandlerFolder = join(__dirname, '../../../handlers/edge/default');

  const pagesManifest = requirePageManifest(nextAppRoot);
  const routesManifest = requireRoutesManifest(nextAppRoot);
  const prerenderManifest = requirePreRenderManifest(nextAppRoot);

  const publicFolder = join(nextAppRoot, NEXT_PUBLIC_FOLDER);
  const publicFiles = existsSync(publicFolder) ? listFiles(publicFolder) : [];

  const runtimeData = createDefaultRuntimeSettings(
    pagesManifest,
    routesManifest,
    prerenderManifest,
    publicFiles,
  );

  return new NodejsFunction(scope, DEFAULT_LAMBDA_NAME, {
    entry: join(defaultHandlerFolder, 'index.js'),
    logRetention: RetentionDays.ONE_DAY,
    bundling: {
      externalModules: [RUNTIME_SETTINGS_FILE],
      commandHooks: {
        beforeInstall: () => [],
        beforeBundling: (_, outputDir) => {
          const temporaryFile = createRuntimeSettingsFile(runtimeData);

          return [`mv ${temporaryFile} ${outputDir}`];
        },
        afterBundling: () => [],
      },
    },
  });
};

const listFiles = (folder: string, relativePrefix = '/'): string[] => {
  return readdirSync(folder, { withFileTypes: true }).reduce((buffer, fileOrFolder) => {
    if (fileOrFolder.isDirectory())
      return [
        ...buffer,
        ...listFiles(join(folder, fileOrFolder.name), join(relativePrefix, fileOrFolder.name)),
      ];
    else return [...buffer, join(relativePrefix, fileOrFolder.name)];
  }, [] as string[]);
};
