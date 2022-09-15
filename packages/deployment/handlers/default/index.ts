import { join } from "path";
import { extractDynamicParams, matchParams } from "../../helpers/dynamic";
import { defaultRuntimeManifest } from "../../types/manifests";
import { CloudFrontRequestHandler } from "aws-lambda";
/**
 * Function triggered by Cloudfront as an origin request
 */
const handler: CloudFrontRequestHandler = async (event) => {
  const request = event.Records[0].cf.request;

  if (!request.uri.startsWith("/_next/")) {
    // Is an initial request (not a request by next in browser)

    const manifest: defaultRuntimeManifest = require("./manifest.json");

    /**
     * If URI matches a known public files, serve this file
     */
    if (manifest.publicFiles.includes(request.uri)) {
      request.uri = join("/public", request.uri);
      return request;
    }

    /**
     * If URI matches a static page, serve the static file
     */
    for (const regex in manifest.staticPages) {
      if (new RegExp(regex, "i").test(request.uri)) {
        request.uri = join("/serverless", manifest.staticPages[regex]);
        return request;
      }
    }

    /**
     * If URI matches a static page with dynamic URI, serve the static file
     */
    for (const regex in manifest.dynamicPages) {
      if (new RegExp(regex, "i").test(request.uri)) {
        const params = extractDynamicParams(
          manifest.dynamicPages[regex].namedRegex,
          request.uri
        );
        if (params === null) continue;

        const matched = manifest.dynamicPages[regex].prerendered.filter(
          (prerendered) =>
            matchParams(
              prerendered.params,
              params,
              Object.keys(manifest.dynamicPages[regex].routeKeys)
            )
        );

        if (matched.length === 1) {
          request.uri = join("/serverless", matched[0].file);
          return request;
        }
      }
    }

    request.uri = join("/serverless", manifest.notFound);
    return request;
  }

  return request;
};

module.exports = { handler };
