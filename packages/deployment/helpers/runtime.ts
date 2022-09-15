import { CloudFrontRequest, CloudFrontResponse } from "aws-lambda";
import { NextApiRequest, NextApiResponse } from "next";
import { parse } from "cookie";
import { Socket } from "net";
import { IncomingMessage } from "http";
import { prepareServerlessUrl } from "next/dist/server/base-server";
import { WritableStream } from "stream/web";

/**
 * From NextApiRequest type defined here
 * https://github.com/vercel/next.js/blob/canary/packages/next/shared/lib/utils.ts#L198
 *
 * And http's IncomingMessage
 * https://www.w3schools.com/nodejs/obj_http_incomingmessage.asp
 *
 * @param request
 * @returns
 */
export const createNextRequestObject = (
  request: CloudFrontRequest
): NextApiRequest => {
  const headers = Object.fromEntries(
    Object.keys(request.headers)
      .map((header) => ({ ...request.headers[header][0], header }))
      .map(({ key, header, value }) => [key ?? header, value])
  );
  return {
    query: Object.fromEntries(
      new URLSearchParams(request.querystring).entries()
    ),
    cookies: parse(request.headers.cookie[0].value),
    body: request.body,
    preview: false,
    headers,
    httpVersion: "1.0",
    httpVersionMajor: 1,
    httpVersionMinor: 0,
    method: request.method,
    rawHeaders: Object.entries(headers).flat(),
    env: {},
    aborted: false,
    complete: true,
    connection: new Socket(),
    socket: new Socket(),
    trailers: {},
    rawTrailers: [],
    setTimeout: undefined as unknown as (
      ms: number,
      cb?: (() => void) | undefined
    ) => NextApiRequest,
    destroy: (() => {}) as unknown as () => NextApiRequest,
    readableAborted: false,
    readable: false,
    readableDidRead: false,
    readableEncoding: null,
    readableEnded: false,
    readableFlowing: null,
    readableHighWaterMark: 0,
    readableLength: 0,
    readableObjectMode: false,
    destroyed: false,
    closed: false,
    errored: null,
    _read: () => {},
    read: () => {},
    setEncoding: (() => {}) as unknown as () => NextApiRequest,
    pause: (() => {}) as unknown as () => NextApiRequest,
    resume: (() => {}) as unknown as () => NextApiRequest,
    isPaused: () => false,
    unpipe: (() => {}) as unknown as () => NextApiRequest,
    unshift: (() => {}) as unknown as () => NextApiRequest,
    wrap: (() => {}) as unknown as () => NextApiRequest,
    push: () => true,
    _destroy: () => {},
    listeners: () => [],
    rawListeners: () => [],
    listenerCount: () => 0,
    addListener: (() => {}) as unknown as () => NextApiRequest,
    removeListener: (() => {}) as unknown as () => NextApiRequest,
    removeAllListeners: (() => {}) as unknown as () => NextApiRequest,
    setMaxListeners: (() => {}) as unknown as () => NextApiRequest,
    getMaxListeners: () => 0,
    eventNames: () => [],
    emit: () => true,
    pipe: (() => {}) as unknown as <T>() => T,
    on: (() => {}) as unknown as () => NextApiRequest,
    off: (() => {}) as unknown as () => NextApiRequest,
    once: (() => {}) as unknown as () => NextApiRequest,
    prependListener: (() => {}) as unknown as () => NextApiRequest,
    prependOnceListener: (() => {}) as unknown as () => NextApiRequest,
    [Symbol.asyncIterator]: async function* () {},
  };
};

/**
 * 
 * WIP ONLY
 * 

export const createNextResponseObject = (
  request: CloudFrontRequest
): NextApiResponse => {
  const headers = Object.fromEntries(
    Object.keys(request.headers)
      .map((header) => ({ ...request.headers[header][0], header }))
      .map(({ key, header, value }) => [key ?? header, value])
  );
  return {
    statusCode: 200,
    connection: new Socket(),
    socket: new Socket(),
    setTimeout: undefined as unknown as (
      ms: number,
      cb?: (() => void) | undefined
    ) => NextApiResponse,
    destroy: (() => {}) as unknown as () => NextApiResponse,
    destroyed: false,
    closed: false,
    errored: null,
    _destroy: () => {},
    listeners: () => [],
    rawListeners: () => [],
    listenerCount: () => 0,
    addListener: (() => {}) as unknown as () => NextApiResponse,
    removeListener: (() => {}) as unknown as () => NextApiResponse,
    removeAllListeners: (() => {}) as unknown as () => NextApiResponse,
    setMaxListeners: (() => {}) as unknown as () => NextApiResponse,
    getMaxListeners: () => 0,
    eventNames: () => [],
    emit: () => true,
    pipe: (() => {}) as unknown as <T>() => T,
    on: (() => {}) as unknown as () => NextApiResponse,
    off: (() => {}) as unknown as () => NextApiResponse,
    once: (() => {}) as unknown as () => NextApiResponse,
    prependListener: (() => {}) as unknown as () => NextApiResponse,
    prependOnceListener: (() => {}) as unknown as () => NextApiResponse,
  };
};
 */
