// example accept-encoding header: Accept-Encoding: deflate, gzip;q=1.0, *;q=0.5
export const isGzipSupported = (headers: { [key: string]: { value: string }[] }): boolean => {
  const acceptEncoding = headers['accept-encoding'];
  if (acceptEncoding) {
    for (let i = 0; i < acceptEncoding.length; i++) {
      const encodingValue = acceptEncoding[i]?.value ?? '';
      const bits = encodingValue.split(',').map(subString => subString.split(';')[0]?.trim());
      if (bits.indexOf('gzip') !== -1) {
        return true;
      }
    }
  }

  return false;
};
