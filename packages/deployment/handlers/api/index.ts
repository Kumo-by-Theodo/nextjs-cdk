import { CloudFrontRequestHandler } from 'aws-lambda';

import toNextHandlerInput from '../../helpers/toNextHandlerInput';
/**
 * Function triggered by Cloudfront as an origin request
 */
export const handler: CloudFrontRequestHandler = async event => {
  const { req, res, responsePromise } = toNextHandlerInput(
    //@ts-expect-error to do: improve typing
    event.Records[0].cf,
    {
      enableHTTPCompression: false,
      rewrittenUri: undefined,
    },
  );

  require('./runtime/api/hello.js').default(req, res);

  return await responsePromise;
};

/**
 * How is handled an api on Next's side :
 * https://github.com/vercel/next.js/blob/canary/packages/next/server/next-server.ts#L747
 *
 */
