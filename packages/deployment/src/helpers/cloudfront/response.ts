import { CloudFrontResultResponse } from 'aws-lambda';

export const buildNotFoundResponse = (): CloudFrontResultResponse => {
  return {
    status: '404',
    statusDescription: 'Not Found',
    headers: {
      'content-type': [
        {
          key: 'Content-Type',
          value: 'text/plain',
        },
      ],
    },
    bodyEncoding: 'text',
    body: 'Not found',
  };
};
