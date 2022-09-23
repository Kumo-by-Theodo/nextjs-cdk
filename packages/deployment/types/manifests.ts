export type ParamsMapping = { [k: string]: string };
type Fallback = false | 'blocking';
type RouteKeys = { [k: string]: string };

export type defaultRuntimeManifest = {
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

/**
 * Exact definition can be found here
 * https://github.com/vercel/next.js/blob/canary/packages/next/build/index.ts#L658
 */
export type RoutesManifest = {
  version: number;
  pages404: boolean;
  basePath: string;
  redirects: {
    source: string;
    destination: string;
    internal: boolean;
    statusCode: number;
    regex: string;
  }[];
  headers: [];
  dynamicRoutes: {
    page: keyof PagesManifest;
    regex: string;
    routeKeys: RouteKeys;
    namedRegex: string;
  }[];
  staticRoutes: {
    page: keyof PagesManifest;
    regex: string;
    routeKeys: {};
    namedRegex: string;
  }[];
  dataRoutes: [];
  rewrites: [];
};

export type PrerenderManifest = {
  version: number;
  routes: Record<
    string,
    {
      initialRevalidateSeconds: boolean | string;
      srcRoute: keyof PagesManifest;
    }
  >;
  dynamicRoutes: Record<
    keyof PagesManifest,
    {
      routeRegex: string;
      dataRoutes: string;
      fallback: Fallback;
      dataRouteRegex: string;
    }
  >;
};

export type PagesManifest = Record<string, string>;
