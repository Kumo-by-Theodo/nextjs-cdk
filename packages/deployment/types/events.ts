import { EncodingOptions } from "aws-cdk-lib";
import { LambdaEdgeEventType } from "aws-cdk-lib/aws-cloudfront";
import { HttpMethod } from "aws-cdk-lib/aws-events";

type Headers = Record<Lowercase<string>, { key: string; value: string }>;

export type CloudfrontRequest = {
  headers: Headers;
  method: HttpMethod;
  origin: {
    custom?: {
      customHeaders: Headers;
      domainName: string;
    };
  };
  querystring: string;
  uri: string;
  body?: {
    inputTruncated: boolean;
    action: "read-only" | "replace";
    encoding: "base64" | "text";
    data: string;
  };
};

export type OriginRequestEvent = {
  Records: {
    cf: {
      config: {
        eventType: LambdaEdgeEventType;
      };
      request: CloudfrontRequest;
    };
  }[];
};
