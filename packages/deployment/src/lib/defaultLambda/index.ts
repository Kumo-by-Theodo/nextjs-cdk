import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import { RetentionDays } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { existsSync, readdirSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { createDefaultHandlerManifest } from 'helpers/manifestBundler';
import {
  requirePageManifest,
  requirePreRenderManifest,
  requireRoutesManifest,
} from 'helpers/nextImport';

const DEFAULT_LAMBDA_NAME = 'NextJSDefault';

export const prepareDefaultHandler = (nextAppRoot: string, scope: Construct): NodejsFunction => {
  const defaultHandlerFolder = join(__dirname, '../../handlers/default');

  const pagesManifest = requirePageManifest(nextAppRoot);
  const routesManifest = requireRoutesManifest(nextAppRoot);
  const prerenderManifest = requirePreRenderManifest(nextAppRoot);

  const publicFolder = join(nextAppRoot, 'public');
  const publicFiles = existsSync(publicFolder) ? listFiles(publicFolder) : [];

  const runtimeManifest = createDefaultHandlerManifest(
    pagesManifest,
    routesManifest,
    prerenderManifest,
    publicFiles,
  );

  return new NodejsFunction(scope, DEFAULT_LAMBDA_NAME, {
    entry: join(defaultHandlerFolder, 'index.js'),
    logRetention: RetentionDays.ONE_DAY,
    bundling: {
      externalModules: ['./manifest.json'],
      commandHooks: {
        beforeInstall: () => [],
        beforeBundling: (_, outputDir) => {
          const tmp_manifest = join(tmpdir(), 'manifest.json');
          writeFileSync(tmp_manifest, JSON.stringify(runtimeManifest));

          return [`cp ${tmp_manifest} ${outputDir}`];
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
