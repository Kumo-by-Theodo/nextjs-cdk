import { ParamsMapping } from '../types/manifests';

export const extractDynamicParams = (namedRegex: string, path: string): null | ParamsMapping =>
  new RegExp(namedRegex, 'i').exec(path)?.groups ?? null;

export const filenameFromParams = (mapping: ParamsMapping, baseFile: string) => {
  let prerenderedFile = baseFile;
  Object.keys(mapping).forEach(key => {
    prerenderedFile = prerenderedFile
      .replace(`[${key}].js`, `${mapping[key]}.html`)
      .replace(`/[${key}]/`, `/${mapping[key]}/`);
  });

  return prerenderedFile;
};

export const matchParams = (params1: ParamsMapping, params2: ParamsMapping, params: string[]) => {
  return !params
    .map(param => params1[param] !== undefined && params1[param] === params2[param])
    .includes(false);
};
