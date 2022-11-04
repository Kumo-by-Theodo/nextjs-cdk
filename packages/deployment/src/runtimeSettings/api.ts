import { getNextHandlerRelativePath } from 'helpers/handlerImport';
import { getNextAPIHandlers } from 'helpers/nextImport';
import { PagesManifest, RoutesManifest } from 'types/manifests';
import { apiRuntimeSettings } from 'types/runtimeSettings';

export const createAPIRuntimeSettings = (
  pagesManifest: PagesManifest,
  routesManifest: RoutesManifest,
): apiRuntimeSettings => {
  const nextApiHandlers = getNextAPIHandlers(pagesManifest);
  const apiKeys = Object.keys(nextApiHandlers);

  // Dynamic APIs
  const dynamicApiPathsEntries = routesManifest.dynamicRoutes
    .filter(dynamicRoute => apiKeys.includes(dynamicRoute.page))
    .map(dynamicRoute => ({
      ...dynamicRoute,
      apiPath: getNextHandlerRelativePath(nextApiHandlers[dynamicRoute.page] as string),
    }));
  const dynamicApiKeys = dynamicApiPathsEntries.map(dynamicRoute => dynamicRoute.page);
  const dynamicApiPaths = Object.fromEntries(
    dynamicApiPathsEntries.map(dynamicRoute => [dynamicRoute.regex, dynamicRoute]),
  );

  // Static APIs
  const staticApiRuntimeHandlersPathEntries = Object.entries(nextApiHandlers)
    .filter(([apiKey]) => !dynamicApiKeys.includes(apiKey))
    .map(([pathname, handlerPath]) => [pathname, getNextHandlerRelativePath(handlerPath)]);

  const staticApiPaths = Object.fromEntries(staticApiRuntimeHandlersPathEntries) as {
    [pathname: string]: string;
  };

  return {
    staticApiPaths,
    dynamicApiPaths,
  };
};
