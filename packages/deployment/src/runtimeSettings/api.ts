import { getNextHandlerRelativePath } from 'helpers/handlerImport';
import { getNextAPIHandlers } from 'helpers/nextImport';
import { apiRuntimeSettings } from 'types/runtimeSettings';

export const createAPIRuntimeSettings = (nextRoot: string): apiRuntimeSettings => {
  const nextApiHandlers = getNextAPIHandlers(nextRoot);
  const pathnameToRuntimeHandlersPathEntries = Object.entries(nextApiHandlers).map(
    ([pathname, handlerPath]) => [pathname, getNextHandlerRelativePath(handlerPath)],
  );

  const pathnameToRuntimeHandlersPath = Object.fromEntries(
    pathnameToRuntimeHandlersPathEntries,
  ) as { [pathname: string]: string };

  return { handlersPaths: pathnameToRuntimeHandlersPath };
};
