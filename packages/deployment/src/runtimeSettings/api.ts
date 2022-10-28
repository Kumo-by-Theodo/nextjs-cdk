import { getNextHandlerRelativePath } from 'helpers/handlerImport';
import { getNextAPIHandlers } from 'helpers/nextImport';
import { PagesManifest, RoutesManifest } from 'types/manifests';
import { apiRuntimeSettings } from 'types/runtimeSettings';

export const createAPIRuntimeSettings = (
  pagesManifest: PagesManifest,
  routesManifest: RoutesManifest,
): apiRuntimeSettings => {
  const nextApiHandlers = getNextAPIHandlers(pagesManifest);
  const pathnameToRuntimeHandlersPathEntries = Object.entries(nextApiHandlers).map(
    ([pathname, handlerPath]) => [pathname, getNextHandlerRelativePath(handlerPath)],
  );

  const pathnameToRuntimeHandlersPath = Object.fromEntries(
    pathnameToRuntimeHandlersPathEntries,
  ) as { [pathname: string]: string };

  return { handlersPaths: pathnameToRuntimeHandlersPath };
};
