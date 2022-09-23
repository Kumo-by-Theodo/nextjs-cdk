import * as Stream from "stream";
import * as zlib from "zlib";
import * as http from "http";
import {
  CloudFrontHeaders,
  CloudFrontRequest,
  CloudFrontResultResponse,
} from "aws-lambda";
import { IncomingMessage, ServerResponse } from "http";
import {
  NodeNextRequest,
  NodeNextResponse,
} from "next/dist/server/base-http/node";
import { NextApiRequest, NextApiResponse } from "next/types";

type CompatOptions = {
  enableHTTPCompression?: boolean;
  rewrittenUri?: string;
};

const specialNodeHeaders = [
  "age",
  "authorization",
  "content-length",
  "content-type",
  "etag",
  "expires",
  "from",
  "host",
  "if-modified-since",
  "if-unmodified-since",
  "last-modified",
  "location",
  "max-forwards",
  "proxy-authorization",
  "referer",
  "retry-after",
  "user-agent",
];

const readOnlyCloudFrontHeaders: { [key: string]: boolean } = {
  "accept-encoding": true,
  "content-length": true,
  "if-modified-since": true,
  "if-none-match": true,
  "if-range": true,
  "if-unmodified-since": true,
  "transfer-encoding": true,
  via: true,
};

const HttpStatusCodes: { [key: number]: string } = {
  202: "Accepted",
  502: "Bad Gateway",
  400: "Bad Request",
  409: "Conflict",
  100: "Continue",
  201: "Created",
  417: "Expectation Failed",
  424: "Failed Dependency",
  403: "Forbidden",
  504: "Gateway Timeout",
  410: "Gone",
  505: "HTTP Version Not Supported",
  418: "I'm a teapot",
  419: "Insufficient Space on Resource",
  507: "Insufficient Storage",
  500: "Server Error",
  411: "Length Required",
  423: "Locked",
  420: "Method Failure",
  405: "Method Not Allowed",
  301: "Moved Permanently",
  302: "Moved Temporarily",
  207: "Multi-Status",
  300: "Multiple Choices",
  511: "Network Authentication Required",
  204: "No Content",
  203: "Non Authoritative Information",
  406: "Not Acceptable",
  404: "Not Found",
  501: "Not Implemented",
  304: "Not Modified",
  200: "OK",
  206: "Partial Content",
  402: "Payment Required",
  308: "Permanent Redirect",
  412: "Precondition Failed",
  428: "Precondition Required",
  102: "Processing",
  407: "Proxy Authentication Required",
  431: "Request Header Fields Too Large",
  408: "Request Timeout",
  413: "Request Entity Too Large",
  414: "Request-URI Too Long",
  416: "Requested Range Not Satisfiable",
  205: "Reset Content",
  303: "See Other",
  503: "Service Unavailable",
  101: "Switching Protocols",
  307: "Temporary Redirect",
  429: "Too Many Requests",
  401: "Unauthorized",
  422: "Unprocessable Entity",
  415: "Unsupported Media Type",
  305: "Use Proxy",
};

const toCloudFrontHeaders = (
  headers: { [key: string]: string | string[] },
  headerNames: { [key: string]: string },
  originalHeaders: {} = {}
) => {
  const result = {} as { [key: string]: string | string[] };

  // Object.entries(originalHeaders).forEach(([headerName, headerValue]) => {
  //   result[headerName.toLowerCase()] = headerValue;
  // });

  Object.entries(headers).forEach(([headerName, headerValue]) => {
    const headerKey = headerName.toLowerCase();
    headerName = headerNames[headerKey] || headerName;

    if (readOnlyCloudFrontHeaders[headerKey]) {
      return;
    }

    result[headerKey] = [];

    if (headerValue instanceof Array) {
      headerValue.forEach((val) => {
        if (val) {
          //@ts-expect-error
          result[headerKey].push({
            key: headerName,
            value: val.toString(),
          });
        }
      });
    } else {
      if (headerValue) {
        //@ts-expect-error
        result[headerKey].push({
          key: headerName,
          value: headerValue.toString(),
        });
      }
    }
  });

  return result;
};

const defaultOptions = {
  enableHTTPCompression: false,
};

const handler = (
  cfRequest: CloudFrontRequest,
  { enableHTTPCompression, rewrittenUri }: CompatOptions
): {
  responsePromise: Promise<CloudFrontResultResponse>;
  req: NextApiRequest;
  res: NextApiResponse;
} => {
  // const cfResponse = { headers: {} } as CloudFrontResultResponse;

  const response = {
    headers: {},
  } as CloudFrontResultResponse;

  const newStream = new Stream.Readable();

  const req: NextApiRequest = Object.assign(
    newStream,
    http.IncomingMessage.prototype
  ) as unknown as NextApiRequest;
  req.url = rewrittenUri || cfRequest.uri;
  req.method = cfRequest.method;
  req.rawHeaders = [];
  req.headers = {};

  if (cfRequest.querystring) {
    req.url = req.url + `?` + cfRequest.querystring;
  }

  const headers = cfRequest.headers || {};

  for (const lowercaseKey of Object.keys(headers)) {
    const headerKeyValPairs = headers[lowercaseKey];

    headerKeyValPairs
      .filter(({ key }) => key !== undefined)
      .forEach((keyVal) => {
        req.rawHeaders.push(keyVal.key as string);
        req.rawHeaders.push(keyVal.value);
      });

    req.headers[lowercaseKey] = headerKeyValPairs[0].value;
  }
  // req.getHeader = (name) => {
  //   return req.headers[name.toLowerCase()];
  // };

  // req.getHeaders = () => {
  //   return req.headers;
  // };

  if (cfRequest.body && cfRequest.body.data) {
    req.push(
      cfRequest.body.data,
      cfRequest.body.encoding ? "base64" : undefined
    );
  }

  req.push(null);

  const res = new Stream.Stream() as NextApiResponse & {
    headers: { [key: string]: string | number | readonly string[] };
  };
  res.finished = false;

  Object.defineProperty(res, "statusCode", {
    get() {
      return response.status;
    },
    set(statusCode) {
      response.status = statusCode.toString();
      response.statusDescription = HttpStatusCodes[statusCode];
    },
  });

  const headerNames = {} as { [key: string]: string | number | string[] };

  res.writeHead = (status, headers) => {
    response.status = status.toString();
    response.statusDescription = HttpStatusCodes[status];

    return res;
  };
  res.write = (chunk) => {
    if (response.body === undefined) {
      response.body = "";
    }

    response.body += Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);

    return true;
  };

  const responsePromise = new Promise<CloudFrontResultResponse>((resolve) => {
    //@ts-expect-error
    res.end = (text) => {
      if (res.finished === true) {
        return;
      }

      res.finished = true;

      if (text) res.write(text);

      if (!res.statusCode) {
        res.statusCode = 200;
      }

      if (response.body) {
        response.bodyEncoding = "base64";
        response.body = Buffer.from(response.body).toString("base64");
      }

      //@ts-expect-error
      response.headers = toCloudFrontHeaders(res.headers, headerNames, {});

      resolve(response);
      return res;
    };
  });

  res.setHeader = (name, value) => {
    res.headers[name.toLowerCase()] = value;
    headerNames[name.toLowerCase()] = name;

    return res;
  };
  res.removeHeader = (name) => {
    delete res.headers[name.toLowerCase()];
  };
  res.getHeader = (name) => {
    return res.headers[name.toLowerCase()] as string | number | string[];
  };
  res.getHeaders = () => {
    return res.headers as { [key: string]: string | number | string[] };
  };
  res.hasHeader = (name) => {
    return !!res.getHeader(name);
  };

  Object.defineProperty(req, "originalRequest", { get: () => {} });
  Object.defineProperty(res, "originalResponse", { get: () => {} });

  return {
    req,
    res,
    responsePromise,
  };
};

handler.SPECIAL_NODE_HEADERS = specialNodeHeaders;

export default handler;
