import { CloudFrontRequest, CloudFrontRequestEvent, CloudFrontRequestHandler } from 'aws-lambda';
import { join } from 'path';

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
  const request = event.Records[0]?.cf?.request;

  if (request === undefined) {
    throw new Error('Request is undefined');
  }

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
    request.uri = join('/public', request.uri);

    return Promise.resolve(request);
  }

  /**
   * If URI matches a static page, serve the static file
   */
  for (const regex in manifest.staticPages) {
    if (new RegExp(regex, 'i').test(request.uri)) {
      request.uri = join('/serverless', manifest.staticPages[regex] as string);

      return Promise.resolve(request);
    }
  }

  /**
   * If URI matches a static page with dynamic URI, serve the static file
   */
  for (const regex in manifest.dynamicPages) {
    if (!new RegExp(regex, 'i').test(request.uri)) continue;
    // @ts-expect-error -- manifest.dynamicPages[regex] exists
    const params = extractDynamicParams(manifest.dynamicPages[regex].namedRegex, request.uri);
    if (params === null) continue;
    // @ts-expect-error -- manifest.dynamicPages[regex] exists
    const matched = manifest.dynamicPages[regex].prerendered.filter(prerendered =>
      matchParams(
        prerendered.params,
        params,
        // @ts-expect-error -- manifest.dynamicPages[regex] exists
        Object.keys(manifest.dynamicPages[regex].routeKeys),
      ),
    );
    if (matched.length !== 1) continue;

    request.uri = join('/serverless', matched[0]?.file as string);

    return Promise.resolve(request);
  }

  request.uri = join('/serverless', manifest.notFound);

  return Promise.resolve(request);
};

export { handler };
