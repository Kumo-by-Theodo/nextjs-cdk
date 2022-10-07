import { readOnlyCloudFrontHeaders } from './constants';

type Headers = { [key: string]: string | string[] };

export const toCloudFrontHeaders = (
  headers: Headers,
  headerNames: { [key: string]: string },
  originalHeaders: Headers,
) => {
  const result: Headers = {};

  Object.entries(originalHeaders).forEach(([headerName, headerValue]) => {
    result[headerName.toLowerCase()] = headerValue;
  });

  Object.entries(headers).forEach(([headerName, headerValue]) => {
    const headerKey = headerName.toLowerCase();
    headerName = headerNames[headerKey] ?? headerName;

    if (readOnlyCloudFrontHeaders[headerKey]) {
      return;
    }

    result[headerKey] = [];

    if (headerValue instanceof Array) {
      headerValue.forEach(val => {
        if (val) {
          //@ts-expect-error
          result[headerKey].push({
            key: headerName,
            value: val.toString(),
          });
        }
      });
    } else {
      if (headerValue) {
        //@ts-expect-error
        result[headerKey].push({
          key: headerName,
          value: headerValue.toString(),
        });
      }
    }
  });

  return result;
};
