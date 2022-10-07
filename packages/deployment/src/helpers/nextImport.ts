import { join } from 'path';

import {
  API_PATH_PREFIX,
  NEXT_API_HANDLERS_FOLDER,
  NEXT_CHUNKS_FOLDER,
  NEXT_WEBPACK_API_RUNTIME_FILE,
  NextManifestPaths,
  NextManifestPathsType,
} from 'constants/nextPaths';
import { PagesManifest, PrerenderManifest, RoutesManifest } from 'types/manifests';

const requireNextManifest = (nextRoot: string, path: NextManifestPathsType): unknown => {
  return require(join(nextRoot, path));
};

export const requirePageManifest = (nextRoot: string): PagesManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.PAGES) as PagesManifest;

export const requireRoutesManifest = (nextRoot: string): RoutesManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.ROUTES) as RoutesManifest;

export const requirePreRenderManifest = (nextRoot: string): PrerenderManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.PRERENDER) as PrerenderManifest;

export const requireHandlerFromPath = (nextRoot: string): PagesManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.PAGES) as PagesManifest;

export const getNextAPIHandlers = (nextRoot: string): PagesManifest => {
  const pageManifest = requirePageManifest(nextRoot);
  const APIPaths = Object.keys(pageManifest).filter(path => path.startsWith(API_PATH_PREFIX));

  return Object.fromEntries(APIPaths.map(path => [path, pageManifest[path]]));
};

export const getNextChunkFolder = (nextRoot: string): string => join(nextRoot, NEXT_CHUNKS_FOLDER);

export const getAPIHandlersFolder = (nextRoot: string): string =>
  join(nextRoot, NEXT_API_HANDLERS_FOLDER);

export const getWebpackApiRuntimeFile = (nextRoot: string): string =>
  join(nextRoot, NEXT_WEBPACK_API_RUNTIME_FILE);
