import { CloudFrontRequest, CloudFrontResultResponse } from "aws-lambda";
import { HttpStatusCodes, specialNodeHeaders } from "./constants";
import { isGzipSupported } from "./isGzipSupported";
import { toCloudFrontHeaders } from "./toCloudFrontHeaders";
import * as Stream from "stream";
import * as zlib from "zlib";
import * as http from "http";
import { NextApiRequest, NextApiResponse } from "next/types";

interface CompatOptions {
  enableHTTPCompression?: boolean;
  rewrittenUri?: string;
}

interface CloudFrontEvent {
  request: CloudFrontRequest;
  response: CloudFrontResultResponse;
}

interface Return {
  responsePromise: Promise<CloudFrontResultResponse>;
  req: NextApiRequest;
  res: NextApiResponse;
}

const defaultOptions = {
  enableHTTPCompression: false,
};

const toNextHandlerInput = (
  event: CloudFrontEvent,
  { enableHTTPCompression, rewrittenUri }: CompatOptions = defaultOptions
): Return => {
  const { request: cfRequest, response: cfResponse = { headers: {} } } = event;

  const response = {
    headers: {},
  } as CloudFrontResultResponse;

  const newStream = new Stream.Readable();

  const req = Object.assign(
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

    headerKeyValPairs.forEach((keyVal) => {
      req.rawHeaders.push(keyVal.key as string);
      req.rawHeaders.push(keyVal.value);
    });

    req.headers[lowercaseKey] = headerKeyValPairs[0].value;
  }
  //@ts-expect-error
  req.getHeader = (name: string) => {
    return req.headers[name.toLowerCase()];
  };
  //@ts-expect-error
  req.getHeaders = () => {
    return req.headers;
  };

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

  res.headers = {};
  const headerNames = {};
  res.writeHead = (status, headers) => {
    response.status = status.toString();
    response.statusDescription = HttpStatusCodes[status];

    if (headers) {
      res.headers = Object.assign(res.headers, headers);
    }
    return res;
  };
  //@ts-expect-error
  res.write = (chunk) => {
    if (!response.body) {
      //@ts-expect-error
      response.body = Buffer.from("");
    }
    //@ts-expect-error
    response.body = Buffer.concat([
      //@ts-expect-error
      response.body,
      Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk),
    ]);
  };

  let shouldGzip = enableHTTPCompression && isGzipSupported(headers);

  const responsePromise = new Promise((resolve) => {
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
        response.body = shouldGzip
          ? zlib.gzipSync(response.body).toString("base64")
          : Buffer.from(response.body).toString("base64");
      }
      //@ts-expect-error
      response.headers = toCloudFrontHeaders(
        //@ts-expect-error
        res.headers,
        headerNames,
        cfResponse.headers
      );

      if (shouldGzip) {
        //@ts-expect-error
        response.headers["content-encoding"] = [
          { key: "Content-Encoding", value: "gzip" },
        ];
      }
      resolve(response);
    };
  });
  //@ts-expect-error
  res.setHeader = (name, value) => {
    res.headers[name.toLowerCase()] = value;
    //@ts-expect-error
    headerNames[name.toLowerCase()] = name;
  };
  res.removeHeader = (name) => {
    delete res.headers[name.toLowerCase()];
  };
  //@ts-expect-error
  res.getHeader = (name) => {
    return res.headers[name.toLowerCase()];
  };
  //@ts-expect-error
  res.getHeaders = () => {
    return res.headers;
  };
  res.hasHeader = (name) => {
    return !!res.getHeader(name);
  };

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

  return {
    req,
    res,
    //@ts-expect-error
    responsePromise,
  };
};

toNextHandlerInput.SPECIAL_NODE_HEADERS = specialNodeHeaders;

export default toNextHandlerInput;
