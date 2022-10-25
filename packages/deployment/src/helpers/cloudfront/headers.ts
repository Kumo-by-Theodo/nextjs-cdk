import { CloudFrontHeaders } from 'aws-lambda';
import { IncomingHttpHeaders, OutgoingHttpHeader } from 'http';

type HeadersEntries = [string, IncomingHttpHeaders | OutgoingHttpHeader | undefined][];

export const cfHeadersToEntries = (cfHeaders: CloudFrontHeaders): HeadersEntries =>
  Object.keys(cfHeaders).map(headerName => [headerName, cfHeaders[headerName]?.[0]?.value]);

export const headerEntriesToCfHeaders = (headerEntries: HeadersEntries): CloudFrontHeaders =>
  Object.fromEntries(
    headerEntries.map(([key, value]) => [
      key.toLowerCase(),
      [{ key, value: value?.toString() ?? '' }],
    ]),
  ) as CloudFrontHeaders;
