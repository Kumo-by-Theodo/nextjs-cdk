import { Callback, CloudFrontRequestEventRecord, Context } from 'aws-lambda';
import { apiResolver } from 'next/dist/server/api-utils/node';

import { handler } from '../index';

const mockEmptyContext = {} as Context;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const mockVoidCallback = (() => {}) as Callback;

jest.mock('constants/paths', () => ({
  RUNTIME_SETTINGS_FILE: '../../__mocks__/mock-runtime-settings.json',
  APP_SERVER_FILE_PATH: 'server',
  APP_PUBLIC_FILE_PATH: 'public',
}));

jest.mock('next/dist/server/api-utils/node', () => ({
  apiResolver: jest.fn((...args) => console.log(args)),
}));

describe('handler', () => {
  it('should throw if the request is not defined', () => {
    expect(() => handler({ Records: [] }, mockEmptyContext, mockVoidCallback)).toThrow();
  });

  it('should resolve the request to not found if the api is not known', async () => {
    const cloudFrontEvent = {
      cf: {
        request: { uri: '/api/unknown-path' },
      },
    } as unknown as CloudFrontRequestEventRecord;

    await expect(
      handler({ Records: [cloudFrontEvent] }, mockEmptyContext, mockVoidCallback),
    ).resolves.toEqual({ ...cloudFrontEvent.cf.request, uri: '/server/pages/404.html' });
  });

  it('should resolve the request to a static page', async () => {
    const cloudFrontEvent = {
      cf: {
        request: { uri: '/api/hello' },
      },
    } as unknown as CloudFrontRequestEventRecord;

    await handler({ Records: [cloudFrontEvent] }, mockEmptyContext, mockVoidCallback);

    expect(apiResolver).toHaveBeenCalledTimes(1);
    expect(apiResolver).toHaveBeenCalledWith('toto');
  });
});
