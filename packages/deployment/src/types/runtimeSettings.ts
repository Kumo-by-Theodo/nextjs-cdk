import { Fallback, PagesManifest, ParamsMapping, RouteKeys } from './manifests';

export type defaultRuntimeSettings = {
  staticPages: Record<string, keyof PagesManifest>;
  publicFiles: string[];
  dynamicPages: Record<string, DynamicPageEntry>;
  notFound: string;
};

export type DynamicPageEntry = {
  fallback: Fallback;
  routeKeys: RouteKeys;
  namedRegex: string;
  prerendered: PrerenderedEntry[];
};

export type PrerenderedEntry = { params: ParamsMapping; file: string };

export type apiRuntimeSettings = {
  staticApiPaths: { [pathname: string]: string };
  dynamicApiPaths: {
    [regexKey: string]: {
      page: string;
      regex: string;
      routeKeys: RouteKeys;
      namedRegex: string;
      apiPath: string;
    };
  };
};
