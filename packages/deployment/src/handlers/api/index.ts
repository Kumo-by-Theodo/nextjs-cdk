/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CloudFrontRequestEventRecord, CloudFrontRequestHandler } from 'aws-lambda';
import { apiResolver } from 'next/dist/server/api-utils/node';

import { RUNTIME_SETTINGS_FILE } from 'constants/handlerPaths';
import { CustomIncomingMessage } from 'helpers/cloudfront/CustomIncomingMessage';
import { CustomServerResponse } from 'helpers/cloudfront/CustomServerResponse';
import { buildNotFoundResponse } from 'helpers/cloudfront/buildNotFoundResponse';
import { apiRuntimeSettings } from 'types/runtimeSettings';

/**
 * Function triggered by Cloudfront as an origin request
 */
export const handler: CloudFrontRequestHandler = async event => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const runtimeSettings = require(RUNTIME_SETTINGS_FILE) as apiRuntimeSettings;

  const pathname = event.Records[0]?.cf?.request?.uri ?? '';
  const nextApiHandlerPath = runtimeSettings.handlersPaths[pathname];
  if (nextApiHandlerPath === undefined) {
    return buildNotFoundResponse();
  }

  const req = new CustomIncomingMessage(
    (event.Records[0] as CloudFrontRequestEventRecord).cf.request,
  );
  const res = new CustomServerResponse();
  await apiResolver(
    req,
    res,
    undefined,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(nextApiHandlerPath),
    { previewModeId: '', previewModeSigningKey: '', previewModeEncryptionKey: '' },
    true,
  );

  return await res.finishedPromise;
};
