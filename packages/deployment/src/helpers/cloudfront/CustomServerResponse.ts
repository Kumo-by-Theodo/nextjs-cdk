import { CloudFrontResultResponse } from 'aws-lambda';
import { IncomingMessage, OutgoingHttpHeader, OutgoingHttpHeaders, ServerResponse } from 'http';
import { Socket } from 'net';
import stream from 'stream';

import { readOnlyCloudFrontHeaders, StatusMessageMapping } from 'constants/cloudfront';

import { headerEntriesToCfHeaders } from './headers';

/**
 * Custom class that mocks the expected http Server Response
 * and resolves to a valid CloudFrontResultResponse object
 *
 * It waits for the `end()` method to be called before resolving the `finishedPromise` Promise
 */
export class CustomServerResponse extends stream.Writable implements ServerResponse {
  ended = false;
  statusCode = 200;
  statusMessage = StatusMessageMapping[200] as string;
  headers: OutgoingHttpHeaders = {};
  finished = false;
  headersSent = false;
  cfResponse: CloudFrontResultResponse = { status: '200' };

  public promiseResolver: ((result: CloudFrontResultResponse) => void) | undefined;
  public finishedPromise: Promise<CloudFrontResultResponse> = new Promise(resolve => {
    this.promiseResolver = resolve;
  });

  constructor() {
    super();
  }

  flushHeaders(): void {
    this.headers = {};
  }

  setHeader(name: string, value: string | number | readonly string[]): this {
    this.headers[name] = Array.isArray(value)
      ? (value.concat() as string[])
      : (value as number | string);

    return this;
  }
  getHeader(name: string): string | number | string[] | undefined {
    return this.headers[name.toLowerCase()];
  }
  getHeaders(): OutgoingHttpHeaders {
    return this.headers;
  }
  getHeaderNames(): string[] {
    return Object.keys(this.headers);
  }
  hasHeader(name: string): boolean {
    return this.getHeader(name) !== undefined;
  }
  removeHeader(name: string): void {
    delete this.headers[name.toLowerCase()];
  }

  write(
    chunk: unknown,
    callback?: ((error: Error | null | undefined) => void) | undefined,
  ): boolean;
  write(
    chunk: unknown,
    encoding: BufferEncoding,
    callback?: ((error: Error | null | undefined) => void) | undefined,
  ): boolean;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  write(chunk: unknown, encoding?: unknown, _callback?: unknown): boolean {
    if (this.cfResponse.body === undefined) this.cfResponse.body = '';
    this.cfResponse.body += Buffer.isBuffer(chunk)
      ? chunk.toString(encoding as BufferEncoding | undefined)
      : chunk;

    return true;
  }

  writeHead(
    statusCode: number,
    statusMessage?: string | undefined,
    headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined,
  ): this;
  writeHead(
    statusCode: number,
    headers?: OutgoingHttpHeaders | OutgoingHttpHeader[] | undefined,
  ): this;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  writeHead(statusCode: number, statusMessage?: unknown, headers?: unknown): this {
    this.statusCode = statusCode;
    this.statusMessage =
      typeof statusMessage === 'string' ? statusMessage : StatusMessageMapping[statusCode] ?? '';

    Object.entries(headers as OutgoingHttpHeaders | OutgoingHttpHeader[]).forEach(
      ([name, value]) => {
        if (value !== undefined) this.setHeader(name, value);
      },
    );

    return this;
  }

  end(cb?: (() => void) | undefined): this;
  end(chunk: unknown, cb?: (() => void) | undefined): this;
  end(chunk: unknown, encoding: BufferEncoding, cb?: (() => void) | undefined): this;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  end(chunk?: unknown, encoding?: unknown, _cb?: unknown): this {
    if (this.promiseResolver === undefined) {
      console.warn('Response has no resolver, ignoring res.end()');

      return this;
    }

    if (this.ended) {
      console.warn('Response already ended, ignoring call to res.end()');

      return this;
    }
    this.ended = true;
    this.finished = true;
    this.headersSent = true;

    if (chunk !== undefined) this.write(chunk, encoding as BufferEncoding);
    if (this.cfResponse.body !== undefined) this.cfResponse.bodyEncoding = 'text';

    this.cfResponse.headers = headerEntriesToCfHeaders(Object.entries(this.headers));
    readOnlyCloudFrontHeaders.forEach(key => delete this.cfResponse.headers?.[key]);

    this.cfResponse.status = this.statusCode.toString();
    this.cfResponse.statusDescription = this.statusMessage.toString();

    this.promiseResolver(this.cfResponse);

    return this;
  }

  // All these methods and attributes are only set for compatibility purposes
  assignSocket = ignoreMethod;
  detachSocket = ignoreMethod;
  writeContinue = ignoreMethod;
  writeProcessing = ignoreMethod;
  req = new IncomingMessage(new Socket());
  chunkedEncoding = false;
  shouldKeepAlive = false;
  useChunkedEncodingByDefault = false;
  sendDate = false;
  connection = null;
  socket = null;
  setTimeout(): this {
    return this;
  }
  addTrailers(): void {
    throw new Error('Trailers not implemented.');
  }
}

const ignoreMethod = (): void => {
  return;
};
