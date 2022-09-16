import { CloudFrontRequestHandler, CloudFrontResultResponse } from "aws-lambda";
/**
 * Function triggered by Cloudfront as an origin request
 */
const handler: CloudFrontRequestHandler = async (event) => {
  const response: CloudFrontResultResponse = {
    status: "200",
    statusDescription: "OK",
    headers: {
      "content-type": [{ key: "Content-Type", value: "application/json" }],
    },
    body: JSON.stringify({ test: "api lambda" }),
  };
  return response;
};

module.exports = { handler };


/**
 * How is handled an api on Next's side : 
 * https://github.com/vercel/next.js/blob/canary/packages/next/server/next-server.ts#L747
 * 
 */