import { join } from 'path';

import { API_HANDLERS_FOLDER } from 'constants/handlerPaths';

export const getRelativeHandlerNextHandlerFromPath = (path: string): string =>
  './' + join(API_HANDLERS_FOLDER, path.replace(/^pages\/api\//, ''));
