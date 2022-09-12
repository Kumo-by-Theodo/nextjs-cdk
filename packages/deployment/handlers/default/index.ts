import { join } from "path";
import { CloudfrontRequest, OriginRequestEvent } from "../../types/events";
import { defaultRuntimeManifest } from "../../types/manifests";
/**
 * Function triggered by Cloudfront as an origin request
 */
const handler = (
  event: OriginRequestEvent,
  context: unknown,
  callback: (_: null, request: CloudfrontRequest) => void
): void => {
  const request = event.Records[0].cf.request;

  if (!request.uri.startsWith("/_next/")) {
    const manifest: defaultRuntimeManifest = require("./manifest.json");

    const originalURI = request.uri;
    request.uri = join("/serverless", manifest.notFound);
    for (const regex in manifest.staticPages) {
      if (new RegExp(regex, "i").test(originalURI)) {
        request.uri = join("/serverless", manifest.staticPages[regex]);
        break;
      }
    }
  }

  callback(null, request);
};

module.exports = { handler };
