import { CloudfrontRequest } from "../types/events";
import {
  defaultRuntimeManifest,
  PagesManifest,
  RoutesManifest,
} from "../types/manifests";

export const createDefaultHandlerManifest = (
  pagesManifest: PagesManifest,
  routesManifest: RoutesManifest
): defaultRuntimeManifest => {
  const runtimeManifest = {
    staticPages: Object.fromEntries(
      routesManifest.staticRoutes.map((staticRoute) => [
        staticRoute.regex,
        pagesManifest[staticRoute.page],
      ])
    ),
    notFound: pagesManifest["/404"] ?? "/",
  };

  return runtimeManifest;
};
