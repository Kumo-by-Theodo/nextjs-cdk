import { join } from 'path';

import { API_HANDLERS_FOLDER } from 'constants/handlerPaths';

export const getRelativeHandlerFileFromPath = (path: string): string =>
  './' + join(API_HANDLERS_FOLDER, path);
