import { isGzipSupported } from '../isGzipSupported';

describe('isGzipSupported', () => {
  it("should return true if 'gzip' is in the accept-encoding header", () => {
    expect(
      isGzipSupported({
        'accept-encoding': [{ value: 'deflate, gzip;q=1.0, *;q=0.5' }],
      }),
    ).toBe(true);
  });
});
