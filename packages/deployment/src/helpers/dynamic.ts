import { ParamsMapping } from '../types/manifests';

export const extractDynamicParams = (namedRegex: string, path: string): null | ParamsMapping =>
  new RegExp(namedRegex, 'i').exec(path)?.groups ?? null;

export const filenameFromParams = (mapping: ParamsMapping, baseFile: string): string => {
  let prerenderedFile = baseFile;
  Object.entries(mapping).forEach(([key, mappingValue]) => {
    prerenderedFile = prerenderedFile
      .replace(`[${key}].js`, `${mappingValue}.html`)
      .replace(`/[${key}]/`, `/${mappingValue}/`);
  });

  return prerenderedFile;
};

export const matchParams = (
  params1: ParamsMapping,
  params2: ParamsMapping,
  params: string[],
): boolean => {
  return !params
    .map(param => params1[param] !== undefined && params1[param] === params2[param])
    .includes(false);
};
