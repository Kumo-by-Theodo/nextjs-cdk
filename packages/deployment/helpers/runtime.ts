import { CloudFrontRequest, CloudFrontResponse } from "aws-lambda";
import {
  NodeNextRequest,
  NodeNextResponse,
} from "next/dist/server/base-http/node";
import {
  NextApiRequestCookies,
  SYMBOL_CLEARED_COOKIES,
} from "next/dist/server/api-utils";

import { IncomingMessage, ServerResponse } from "http";

/**
 * From BaseNextRequest type defined here
 * https://github.com/vercel/next.js/blob/canary/packages/next/server/base-http/index.ts#L13
 *
 * And http's IncomingMessage
 * https://www.w3schools.com/nodejs/obj_http_incomingmessage.asp
 *
 * @param request
 * @returns
 */


/**
 * Maybe reuse the work done here
 * https://github.com/serverless-nextjs/serverless-next.js/blob/8e1a42baebe27e260605bb96b63a980322f84566/packages/compat-layers/lambda-at-edge-compat/next-aws-cloudfront.js#L0-L1
 */
export const createNextRequestObject = (
  request: CloudFrontRequest
): NodeNextRequest => {
  const headers = Object.fromEntries(
    Object.keys(request.headers)
      .map((header) => ({ ...request.headers[header][0], header }))
      .map(({ key, header, value }) => [key ?? header, value])
  );

  const req = new NodeNextRequest({
    method: request.method,
    url: request.uri + request.querystring,
    headers,
    cookies: {},
    httpVersion: '1.0',
    httpVersionMajor: 1,
    httpVersionMinor: 0,
    complete: true,
    /** body, headers... */
  } as IncomingMessage & {
    cookies?: NextApiRequestCookies;
  });


  return req
};

/**
 *
 * WIP ONLY
 *
 *
 * https://github.com/vercel/next.js/blob/canary/packages/next/server/base-http/index.ts#L29
 */
export const createNextResponseObject = (
  request: CloudFrontRequest
): NodeNextResponse => {
  return new NodeNextResponse(
    {} as ServerResponse & { [SYMBOL_CLEARED_COOKIES]?: boolean }
  );
};
