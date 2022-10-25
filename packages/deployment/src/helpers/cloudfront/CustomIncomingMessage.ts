import { CloudFrontRequest } from 'aws-lambda';
import { IncomingHttpHeaders, IncomingMessage } from 'http';
import { Socket } from 'net';
import stream from 'stream';

import { cfHeadersToEntries } from './headers';

/**
 * Custom class that mocks the expected http Incoming message
 * Built from provided CloudFrontRequest object
 */
export class CustomIncomingMessage extends stream.Readable implements IncomingMessage {
  aborted = false;
  httpVersion = '1.0';
  httpVersionMajor = 1;
  httpVersionMinor = 0;
  complete = true;
  headers: IncomingHttpHeaders;
  rawHeaders: string[];
  method?: string | undefined;
  url?: string | undefined;

  constructor(cfRequest: CloudFrontRequest) {
    super();
    this.url = cfRequest.uri;
    this.headers = Object.fromEntries(cfHeadersToEntries(cfRequest.headers)) as IncomingHttpHeaders;
    this.rawHeaders = cfHeadersToEntries(cfRequest.headers).flat() as string[];
    if (cfRequest.body !== undefined)
      this.push(cfRequest.body.data, cfRequest.body.encoding === 'base64' ? 'base64' : undefined);
    this.push(null);
  }

  // All these methods and attributes are only set for compatibility purposes
  connection = new Socket();
  socket = new Socket();
  statusCode = undefined;
  statusMessage = undefined;
  trailers = {};
  rawTrailers = [];
  setTimeout(): this {
    return this;
  }
}
