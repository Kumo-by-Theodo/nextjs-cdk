/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CloudFrontRequestEventRecord, CloudFrontRequestHandler } from 'aws-lambda';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { URLSearchParams } from 'url';

import { RUNTIME_SETTINGS_FILE } from 'constants/handlerPaths';
import { CustomIncomingMessage } from 'helpers/cloudfront/CustomIncomingMessage';
import { CustomServerResponse } from 'helpers/cloudfront/CustomServerResponse';
import { buildNotFoundResponse } from 'helpers/cloudfront/buildNotFoundResponse';
import { apiRuntimeSettings } from 'types/runtimeSettings';

const PROPAGATE_ERROR = true;

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

  const { request: cloudfrontRequest } = (event.Records[0] as CloudFrontRequestEventRecord).cf;

  const req = new CustomIncomingMessage(cloudfrontRequest);
  const res = new CustomServerResponse();

  const query = Object.fromEntries(new URLSearchParams(cloudfrontRequest.querystring));

  await apiResolver(
    req,
    res,
    query,
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    require(nextApiHandlerPath),
    { previewModeId: '', previewModeSigningKey: '', previewModeEncryptionKey: '' }, // to do: handle preview mode
    PROPAGATE_ERROR,
  );

  return await res.finishedPromise;
};
