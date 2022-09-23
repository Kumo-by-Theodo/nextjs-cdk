import { CloudFrontRequestHandler, CloudFrontResultResponse } from "aws-lambda";
import toNextObject from "../../helpers/runtime";
/**
 * Function triggered by Cloudfront as an origin request
 */
const handler: CloudFrontRequestHandler = async (event) => {
  const { req, res, responsePromise } = toNextObject(event.Records[0].cf, {
    enableHTTPCompression: false,
    rewrittenUri: undefined,
  });
  if (!req.hasOwnProperty("originalRequest")) {
    Object.defineProperty(req, "originalRequest", {
      get: () => req,
    });
  }
  if (!res.hasOwnProperty("originalResponse")) {
    Object.defineProperty(res, "originalResponse", {
      get: () => res,
    });
  }

  require("./runtime/api/hello.js").default(req, res);

  return await responsePromise;
};

module.exports = { handler };

/**
 * How is handled an api on Next's side :
 * https://github.com/vercel/next.js/blob/canary/packages/next/server/next-server.ts#L747
 *
 */
