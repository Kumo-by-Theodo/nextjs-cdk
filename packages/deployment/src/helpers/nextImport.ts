import { join } from 'path';

import {
  API_PATH_PREFIX,
  NEXT_API_HANDLERS_FOLDER,
  NEXT_BUILD_SERVER_OUTDIR,
  NEXT_BUILD_STATIC_DIR,
  NEXT_CHUNKS_FOLDER,
  NEXT_PUBLIC_FOLDER,
  NEXT_WEBPACK_API_RUNTIME_FILE,
  NextManifestPaths,
  NextManifestPathsType,
} from 'constants/paths';
import { PagesManifest, PrerenderManifest, RoutesManifest } from 'types/manifests';

import { getDepenciesFromHandlerPath } from './nft';

const requireNextManifest = (nextRoot: string, path: NextManifestPathsType): unknown =>
  require(join(nextRoot, path));

export const requirePageManifest = (nextRoot: string): PagesManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.PAGES) as PagesManifest;

export const requireRoutesManifest = (nextRoot: string): RoutesManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.ROUTES) as RoutesManifest;

export const requirePreRenderManifest = (nextRoot: string): PrerenderManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.PRERENDER) as PrerenderManifest;

export const requireHandlerFromPath = (nextRoot: string): PagesManifest =>
  requireNextManifest(nextRoot, NextManifestPaths.PAGES) as PagesManifest;

/**
 * Given the root of the next App, retrieves all static API paths and their
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

  return Object.fromEntries(APIPaths.map(path => [path, pageManifest[path] as string]));
};

/**
 * Uses Next's file tracing .nft.json file to retrieved all used packages.
 * Returns a list of packages names, the version will be automatically deduced
 * by aws CDK with the Next's App root folder `package.json`
 */
export const getNextAPITracedPackages = (nextRoot: string): string[] => {
  const rootFolder = getNextServerFolder(nextRoot);
  const depencies = Object.values(getNextAPIHandlers(nextRoot))
    .map(handlerPath => getDepenciesFromHandlerPath(join(rootFolder, handlerPath)))
    .flat();

  return Array.from(new Set(depencies));
};

/**
 * Example output : `<>/public`
 */
export const getNextPublicFolder = (nextRoot: string): string => join(nextRoot, NEXT_PUBLIC_FOLDER);

/**
 * Example output : `<>/.next/server`
 */
export const getNextServerFolder = (nextRoot: string): string =>
  join(nextRoot, NEXT_BUILD_SERVER_OUTDIR);

/**
 * Example output : `<>/.next/static`
 */
export const getNextStaticFolder = (nextRoot: string): string =>
  join(nextRoot, NEXT_BUILD_STATIC_DIR);

/**
 * Example output : `<>/.next/server/chunks`
 */
export const getNextChunkFolder = (nextRoot: string): string => join(nextRoot, NEXT_CHUNKS_FOLDER);

/**
 * Example output : `<>/.next/server/pages/api`
 */
export const getAPIHandlersFolder = (nextRoot: string): string =>
  join(nextRoot, NEXT_API_HANDLERS_FOLDER);

/**
 * Example output : `<>/.next/server/webpack-api-runtime`
 */
export const getWebpackApiRuntimeFile = (nextRoot: string): string =>
  join(nextRoot, NEXT_WEBPACK_API_RUNTIME_FILE);
