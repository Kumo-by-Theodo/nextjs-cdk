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
export const createNextRequestObject = (
  request: CloudFrontRequest
): NodeNextRequest => {
  const headers = Object.fromEntries(
    Object.keys(request.headers)
      .map((header) => ({ ...request.headers[header][0], header }))
      .map(({ key, header, value }) => [key ?? header, value])
  );

  return new NodeNextRequest({
    method: "",
    url: "",
    cookies: {},
    /** body, headers... */
  } as IncomingMessage & {
    cookies?: NextApiRequestCookies;
  });
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
