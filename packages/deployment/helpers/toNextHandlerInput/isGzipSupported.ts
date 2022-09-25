// example accept-encoding header: Accept-Encoding: deflate, gzip;q=1.0, *;q=0.5
export const isGzipSupported = (headers: {
  [key: string]: { value: string }[];
}): boolean => {
  let gz = false;
  const acceptEncoding = headers["accept-encoding"];
  if (acceptEncoding) {
    for (let i = 0; i < acceptEncoding.length; i++) {
      const { value } = acceptEncoding[i];
      const bits = value.split(",").map((x) => x.split(";")[0].trim());
      if (bits.indexOf("gzip") !== -1) {
        gz = true;
      }
    }
  }
  return gz;
};
