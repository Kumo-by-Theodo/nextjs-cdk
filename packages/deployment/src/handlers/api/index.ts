/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CloudFrontRequestHandler } from 'aws-lambda';

import { RUNTIME_SETTINGS_FILE } from 'constants/handlerPaths';
import { buildNotFoundResponse } from 'helpers/cloudfront/response';
import { apiRuntimeSettings } from 'types/runtimeSettings';

import toNextHandlerInput from '../../helpers/toNextHandlerInput';
/**
 * Function triggered by Cloudfront as an origin request
 */
export const handler: CloudFrontRequestHandler = async event => {
  const { req, res, responsePromise } = toNextHandlerInput(
    //@ts-expect-error to do: improve typing
    event.Records[0].cf,
    {
      enableHTTPCompression: false,
      rewrittenUri: undefined,
    },
  );

  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const runtimeSettings = require(RUNTIME_SETTINGS_FILE) as apiRuntimeSettings;

  const pathname = event.Records[0].cf.request.uri;
  const handlerPath = runtimeSettings.handlersPaths[pathname];
  if (handlerPath === undefined) {
    return buildNotFoundResponse();
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-var-requires
  require(handlerPath).default(req, res);

  return await responsePromise;
};

/**
 * How is handled an api on Next's side :
 * https://github.com/vercel/next.js/blob/canary/packages/next/server/next-server.ts#L747
 *
 */
