export type defaultRuntimeManifest = {
  staticPages: Record<string, keyof PagesManifest>;
  notFound: string;
};

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
  dynamicRoutes: [];
  staticRoutes: {
    page: keyof PagesManifest;
    regex: string;
    routeKeys: {};
    namedRegex: string;
  }[];
  dataRoutes: [];
  rewrites: [];
};

export type PagesManifest = Record<string, string>;
