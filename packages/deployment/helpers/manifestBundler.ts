import {
  defaultRuntimeManifest,
  PagesManifest,
  ParamsMapping,
  PrerenderManifest,
  RoutesManifest,
} from "../types/manifests";
import { extractDynamicParams, filenameFromParams } from "./dynamic";

export const createDefaultHandlerManifest = (
  pagesManifest: PagesManifest,
  routesManifest: RoutesManifest,
  prerenderManifest: PrerenderManifest,
  publicFiles: string[]
): defaultRuntimeManifest => {
  const runtimeManifest = {
    staticPages: Object.fromEntries(
      routesManifest.staticRoutes.map((staticRoute) => [
        staticRoute.regex,
        pagesManifest[staticRoute.page],
      ])
    ),
    publicFiles,
    dynamicPages: Object.fromEntries(
      routesManifest.dynamicRoutes.map((dynamicRoute) => [
        dynamicRoute.regex,
        {
          fallback: prerenderManifest.dynamicRoutes[dynamicRoute.page].fallback,
          routeKeys: dynamicRoute.routeKeys,
          namedRegex: dynamicRoute.namedRegex,
          prerendered: Object.keys(prerenderManifest.routes)
            .map((prerenderedRoute: string) =>
              extractDynamicParams(dynamicRoute.namedRegex, prerenderedRoute)
            )
            .filter((dynamicParams) => dynamicParams !== null)
            .map((dynamicParams) => {
              const filename = filenameFromParams(
                dynamicParams as ParamsMapping,
                pagesManifest[dynamicRoute.page]
              );
              return { params: dynamicParams as ParamsMapping, file: filename };
            }),
        },
      ])
    ),
    notFound: pagesManifest["/404"] ?? "/",
  };

  return runtimeManifest;
};
