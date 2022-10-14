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

/**
 * Give the root of the next App, retrieves all static API paths and their
 * associated handler path. It is a filtered version of the PagesManisfest
 *
 * Example:
 * ```json
 * {
 *   "/api/hello": "pages/api/hello.js",
 *   "/api/bye": "pages/api/bye.js"
 * }
 * ```
 */
export const getNextAPIHandlers = (nextRoot: string): PagesManifest => {
  const pageManifest = requirePageManifest(nextRoot);
  const APIPaths = Object.keys(pageManifest).filter(path => path.startsWith(API_PATH_PREFIX));

  return Object.fromEntries(APIPaths.map(path => [path, pageManifest[path]]));
};

/**
 * Example output : `.next/serverless/chunks`
 */
export const getNextChunkFolder = (nextRoot: string): string => join(nextRoot, NEXT_CHUNKS_FOLDER);

/**
 * Example output : `.next/serverless/pages/api`
 */
export const getAPIHandlersFolder = (nextRoot: string): string =>
  join(nextRoot, NEXT_API_HANDLERS_FOLDER);

/**
 * Example output : `.next/serverless/webpack-api-runtime`
 */
export const getWebpackApiRuntimeFile = (nextRoot: string): string =>
  join(nextRoot, NEXT_WEBPACK_API_RUNTIME_FILE);
