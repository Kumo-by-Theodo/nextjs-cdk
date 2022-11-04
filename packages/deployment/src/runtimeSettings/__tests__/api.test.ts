import fs from 'fs';
import path from 'path';

import { PagesManifest, RoutesManifest } from 'types/manifests';

import { createAPIRuntimeSettings } from '../api';

describe('api', () => {
  it('should generate correct runtime settings', () => {
    const mockPagesManifest = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../__mocks__/mock-pages-manifest.json')).toString(),
    ) as PagesManifest;

    const mockRoutesManifest = JSON.parse(
      fs.readFileSync(path.join(__dirname, '../../__mocks__/mock-routes-manifest.json')).toString(),
    ) as RoutesManifest;

    const expected = {
      staticApiPaths: { '/api/hello': './runtime/api/hello.js' },
      dynamicApiPaths: {
        '^/api/toto/([^/]+?)(?:/)?$': {
          apiPath: './runtime/api/toto/[id].js',
          namedRegex: '^/api/toto/(?<id>[^/]+?)(?:/)?$',
          page: '/api/toto/[id]',
          regex: '^/api/toto/([^/]+?)(?:/)?$',
          routeKeys: {
            id: 'id',
          },
        },
      },
    };

    const generatedAPIRuntimeSettings = createAPIRuntimeSettings(
      mockPagesManifest,
      mockRoutesManifest,
    );

    expect(generatedAPIRuntimeSettings).toEqual(expected);
  });
});
