import { extractDynamicParams, filenameFromParams } from 'helpers/dynamic';
import { defaultRuntimeSettings } from 'types/runtimeSettings';

import {
  PagesManifest,
  ParamsMapping,
  PrerenderManifest,
  RoutesManifest,
} from '../types/manifests';

export const createDefaultRuntimeSettings = (
  pagesManifest: PagesManifest,
  routesManifest: RoutesManifest,
  prerenderManifest: PrerenderManifest,
  publicFiles: string[],
): defaultRuntimeSettings => {
  const runtimeSettings = {
    staticPages: Object.fromEntries(
      routesManifest.staticRoutes.map(staticRoute => [
        staticRoute.regex,
        pagesManifest[staticRoute.page],
      ]),
    ),
    publicFiles,
    dynamicPages: Object.fromEntries(
      routesManifest.dynamicRoutes.map(dynamicRoute => [
        dynamicRoute.regex,
        {
          fallback: prerenderManifest.dynamicRoutes[dynamicRoute.page].fallback,
          routeKeys: dynamicRoute.routeKeys,
          namedRegex: dynamicRoute.namedRegex,
          prerendered: Object.keys(prerenderManifest.routes)
            .map((prerenderedRoute: string) =>
              extractDynamicParams(dynamicRoute.namedRegex, prerenderedRoute),
            )
            .filter(dynamicParams => dynamicParams !== null)
            .map(dynamicParams => {
              const filename = filenameFromParams(
                dynamicParams as ParamsMapping,
                pagesManifest[dynamicRoute.page],
              );

              return { params: dynamicParams as ParamsMapping, file: filename };
            }),
        },
      ]),
    ),
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
    notFound: pagesManifest['/404'] ?? '/',
  };

  return runtimeSettings;
};
