const NEXT_BUILD_OUTDIR = '.next';
const NEXT_BUILD_SERVERLESS_OUTDIR = 'serverless';
export const API_PATH_PREFIX = '/api/';

export const NextManifestPaths = {
  PAGES: `${NEXT_BUILD_OUTDIR}/${NEXT_BUILD_SERVERLESS_OUTDIR}/pages-manifest.json`,
  ROUTES: `${NEXT_BUILD_OUTDIR}/routes-manifest.json`,
  PRERENDER: `${NEXT_BUILD_OUTDIR}/prerender-manifest.json`,
} as const;

type ValueOf<T> = T[keyof T];
export type NextManifestPathsType = ValueOf<typeof NextManifestPaths>;

export const NEXT_CHUNKS_FOLDER = `${NEXT_BUILD_OUTDIR}/${NEXT_BUILD_SERVERLESS_OUTDIR}/chunks`;
export const NEXT_API_HANDLERS_FOLDER = `${NEXT_BUILD_OUTDIR}/${NEXT_BUILD_SERVERLESS_OUTDIR}/pages/api`;
export const NEXT_WEBPACK_API_RUNTIME_FILE = `${NEXT_BUILD_OUTDIR}/${NEXT_BUILD_SERVERLESS_OUTDIR}/webpack-api-runtime.js`;
