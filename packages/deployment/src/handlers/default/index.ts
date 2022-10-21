import { CloudFrontRequest, CloudFrontRequestEvent, CloudFrontRequestHandler } from 'aws-lambda';
import { join } from 'path';

import { APP_PUBLIC_FILE_PATH, APP_SERVER_FILE_PATH } from 'constants/bucketPaths';
import { RUNTIME_SETTINGS_FILE } from 'constants/handlerPaths';
import { extractDynamicParams, matchParams } from 'helpers/dynamic';
import { defaultRuntimeSettings } from 'types/runtimeSettings';

/**
 * Function triggered by Cloudfront as an origin request
 */
// eslint-disable-next-line complexity
const handler: CloudFrontRequestHandler = (
  event: CloudFrontRequestEvent,
): Promise<CloudFrontRequest> => {
  const request: CloudFrontRequest = event.Records[0].cf.request;

  // Request by next in browser
  if (request.uri.startsWith('/_next/')) {
    return Promise.resolve(request);
  }

  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const manifest = require(RUNTIME_SETTINGS_FILE) as defaultRuntimeSettings;

  /**
   * If URI matches a known public files, serve this file
   */
  if (manifest.publicFiles.includes(request.uri)) {
    request.uri = join('/', APP_PUBLIC_FILE_PATH, request.uri);

    return Promise.resolve(request);
  }

  /**
   * If URI matches a static page, serve the static file
   */
  for (const regex in manifest.staticPages) {
    if (new RegExp(regex, 'i').test(request.uri)) {
      request.uri = join('/', APP_SERVER_FILE_PATH, manifest.staticPages[regex]);

      return Promise.resolve(request);
    }
  }

  /**
   * If URI matches a static page with dynamic URI, serve the static file
   */
  for (const regex in manifest.dynamicPages) {
    if (!new RegExp(regex, 'i').test(request.uri)) continue;

    const params = extractDynamicParams(manifest.dynamicPages[regex].namedRegex, request.uri);
    if (params === null) continue;

    const matched = manifest.dynamicPages[regex].prerendered.filter(prerendered =>
      matchParams(prerendered.params, params, Object.keys(manifest.dynamicPages[regex].routeKeys)),
    );
    if (matched.length !== 1) continue;

    request.uri = join('/', APP_SERVER_FILE_PATH, matched[0].file);

    return Promise.resolve(request);
  }

  request.uri = join('/', APP_SERVER_FILE_PATH, manifest.notFound);

  return Promise.resolve(request);
};

export { handler };
