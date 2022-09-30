import { CloudFrontRequest, CloudFrontRequestEvent, CloudFrontRequestHandler } from 'aws-lambda';
import { join } from 'path';

import { extractDynamicParams, matchParams } from '../../helpers/dynamic';
import { defaultRuntimeManifest } from '../../types/manifests';
/**
 * Function triggered by Cloudfront as an origin request
 */
// eslint-disable-next-line complexity
const handler: CloudFrontRequestHandler = (
  event: CloudFrontRequestEvent,
): Promise<CloudFrontRequest> => {
  const request = event.Records[0].cf.request;

  if (!request.uri.startsWith('/_next/')) {
    // Is an initial request (not a request by next in browser)

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-var-requires
    const manifest: defaultRuntimeManifest = require('./manifest.json');

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
        request.uri = join('/serverless', manifest.staticPages[regex]);

        return Promise.resolve(request);
      }
    }

    /**
     * If URI matches a static page with dynamic URI, serve the static file
     */
    for (const regex in manifest.dynamicPages) {
      if (new RegExp(regex, 'i').test(request.uri)) {
        const params = extractDynamicParams(manifest.dynamicPages[regex].namedRegex, request.uri);
        // eslint-disable-next-line max-depth
        if (params === null) continue;

        const matched = manifest.dynamicPages[regex].prerendered.filter(prerendered =>
          matchParams(
            prerendered.params,
            params,
            Object.keys(manifest.dynamicPages[regex].routeKeys),
          ),
        );

        // eslint-disable-next-line max-depth
        if (matched.length === 1) {
          request.uri = join('/serverless', matched[0].file);

          return Promise.resolve(request);
        }
      }
    }

    request.uri = join('/serverless', manifest.notFound);

    return Promise.resolve(request);
  }

  return Promise.resolve(request);
};

module.exports = { handler };
