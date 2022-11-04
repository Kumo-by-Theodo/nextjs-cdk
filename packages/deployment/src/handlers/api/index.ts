/* eslint-disable @typescript-eslint/no-unsafe-call */
import { CloudFrontRequestEventRecord, CloudFrontRequestHandler } from 'aws-lambda';
import { apiResolver } from 'next/dist/server/api-utils/node';
import { URLSearchParams } from 'url';

import { RUNTIME_SETTINGS_FILE } from 'constants/paths';
import {
  buildNotFoundResponse,
  CustomIncomingMessage,
  CustomServerResponse,
} from 'helpers/cloudfront';
import { extractDynamicParams } from 'helpers/dynamic';
import { apiRuntimeSettings } from 'types/runtimeSettings';

const PROPAGATE_ERROR = true;

const getApiHandlerParameters = (
  pathname: string,
  runtimeSettings: apiRuntimeSettings,
): { nextApiHandlerPath: string; pathParameters: Record<string, unknown> } | null => {
  const staticNextApiHandlerPath = runtimeSettings.staticApiPaths[pathname];

  if (staticNextApiHandlerPath !== undefined) {
    return { nextApiHandlerPath: staticNextApiHandlerPath, pathParameters: {} };
  }

  for (const dynamicApiPathEntry of Object.entries(runtimeSettings.dynamicApiPaths)) {
    const [regex, dynamicApiConfig] = dynamicApiPathEntry;
    if (!new RegExp(regex, 'i').test(pathname)) continue;

    const pathParameters = extractDynamicParams(dynamicApiConfig.namedRegex, pathname);

    return { nextApiHandlerPath: dynamicApiConfig.apiPath, pathParameters: pathParameters ?? {} };
  }

  return null;
};

/**
 * Function triggered by Cloudfront as an origin request
 */
export const handler: CloudFrontRequestHandler = async event => {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
  const runtimeSettings = require(RUNTIME_SETTINGS_FILE) as apiRuntimeSettings;

  const pathname = event.Records[0]?.cf?.request?.uri ?? '';

  const apiHandlerParameters = getApiHandlerParameters(pathname, runtimeSettings);

  if (apiHandlerParameters === null) {
    return buildNotFoundResponse();
  }

  const { nextApiHandlerPath, pathParameters } = apiHandlerParameters;

  const { request: cloudfrontRequest } = (event.Records[0] as CloudFrontRequestEventRecord).cf;

  const req = new CustomIncomingMessage(cloudfrontRequest);
  const res = new CustomServerResponse();

  const query = Object.assign(
    Object.fromEntries(new URLSearchParams(cloudfrontRequest.querystring)),
    // If some query parameters have the same name than path parameters, they won't be taken into account. This is the behavior of Next.js
    pathParameters,
  );

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
