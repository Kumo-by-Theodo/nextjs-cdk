import { Fallback, PagesManifest, ParamsMapping, RouteKeys } from './manifests';

export type defaultRuntimeSettings = {
  staticPages: Record<string, keyof PagesManifest>;
  publicFiles: string[];
  dynamicPages: Record<
    string,
    {
      fallback: Fallback;
      routeKeys: RouteKeys;
      namedRegex: string;
      prerendered: { params: ParamsMapping; file: string }[];
    }
  >;
  notFound: string;
};

export type apiRuntimeSettings = {
  handlersPaths: Partial<{ [pathname: string]: string }>;
};
