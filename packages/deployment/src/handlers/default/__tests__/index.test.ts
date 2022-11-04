import { Callback, CloudFrontRequestEventRecord, Context } from 'aws-lambda';

import { handler } from '../index';

const mockEmptyContext = {} as Context;
// eslint-disable-next-line @typescript-eslint/no-empty-function
const mockVoidCallback = (() => {}) as Callback;

jest.mock('constants/paths', () => ({
  RUNTIME_SETTINGS_FILE: '../../__mocks__/mock-runtime-settings.json',
  APP_SERVER_FILE_PATH: 'server',
  APP_PUBLIC_FILE_PATH: 'public',
}));

describe('handler', () => {
  it('should throw if the request is not defined', () => {
    expect(() => handler({ Records: [] }, mockEmptyContext, mockVoidCallback)).toThrow();
  });
  it('should resolve the request if the uri starts by /_next/', async () => {
    const cloudFrontEvent = {
      cf: {
        request: { uri: '/_next/bob' },
      },
    } as unknown as CloudFrontRequestEventRecord;

    await expect(
      handler({ Records: [cloudFrontEvent] }, mockEmptyContext, mockVoidCallback),
    ).resolves.toEqual(cloudFrontEvent.cf.request);
  });

  it('should resolve the request to not found if the uri is not known', async () => {
    const cloudFrontEvent = {
      cf: {
        request: { uri: '/unknown-path' },
      },
    } as unknown as CloudFrontRequestEventRecord;

    await expect(
      handler({ Records: [cloudFrontEvent] }, mockEmptyContext, mockVoidCallback),
    ).resolves.toEqual({ ...cloudFrontEvent.cf.request, uri: '/server/pages/404.html' });
  });

  it('should resolve the request to a public uri', async () => {
    const cloudFrontEvent = {
      cf: {
        request: { uri: '/favicon.ico' },
      },
    } as unknown as CloudFrontRequestEventRecord;

    await expect(
      handler({ Records: [cloudFrontEvent] }, mockEmptyContext, mockVoidCallback),
    ).resolves.toEqual({ ...cloudFrontEvent.cf.request, uri: '/public/favicon.ico' });
  });
  it('should resolve the request to a static page', async () => {
    const cloudFrontEvent = {
      cf: {
        request: { uri: '/' },
      },
    } as unknown as CloudFrontRequestEventRecord;

    await expect(
      handler({ Records: [cloudFrontEvent] }, mockEmptyContext, mockVoidCallback),
    ).resolves.toEqual({ ...cloudFrontEvent.cf.request, uri: '/server/pages/index.html' });
  });
});
