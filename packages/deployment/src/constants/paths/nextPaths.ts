export const NEXT_PUBLIC_FOLDER = 'public';

const NEXT_BUILD_OUTDIR = '.next';

export const NEXT_BUILD_STATIC_DIR = `${NEXT_BUILD_OUTDIR}/static`;

export const NEXT_BUILD_SERVER_OUTDIR = `${NEXT_BUILD_OUTDIR}/server`;

export const NextManifestPaths = {
  PAGES: `${NEXT_BUILD_SERVER_OUTDIR}/pages-manifest.json`,
  ROUTES: `${NEXT_BUILD_OUTDIR}/routes-manifest.json`,
  PRERENDER: `${NEXT_BUILD_OUTDIR}/prerender-manifest.json`,
} as const;

type ValueOf<T> = T[keyof T];
export type NextManifestPathsType = ValueOf<typeof NextManifestPaths>;

export const NEXT_CHUNKS_FOLDER = `${NEXT_BUILD_SERVER_OUTDIR}/chunks`;
export const NEXT_API_HANDLERS_FOLDER = `${NEXT_BUILD_SERVER_OUTDIR}/pages/api`;
export const NEXT_WEBPACK_API_RUNTIME_FILE = `${NEXT_BUILD_SERVER_OUTDIR}/webpack-api-runtime.js`;

export const API_PATH_PREFIX = '/api/';
