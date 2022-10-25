import { existsSync, readFileSync } from 'fs';
import { join, parse } from 'path';

import { NFTData, PackageInfo } from 'types/nft';

export const getDepenciesFromHandlerPath = (handlerPath: string): string[] => {
  const nftFile = `${handlerPath}.nft.json`;
  if (!existsSync(nftFile)) return [];

  const dirPath = parse(handlerPath).dir;

  return getDepenciesFromNFTFile(JSON.parse(readFileSync(nftFile).toString()) as NFTData, dirPath);
};

const isDepencyRegexp = new RegExp('node_modules.*package\\.json$');

const getDepenciesFromNFTFile = (data: NFTData, dir: string) =>
  data.files
    .filter(relativeFilePath => isDepencyRegexp.test(relativeFilePath))
    .map(relativeFilePath => join(dir, relativeFilePath))
    .filter(existsSync)
    .map(filePath => readFileSync(filePath))
    .map(packageInfo => (JSON.parse(packageInfo.toString()) as PackageInfo).name);
