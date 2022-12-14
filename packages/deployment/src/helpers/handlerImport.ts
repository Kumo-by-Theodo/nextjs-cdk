import { join } from 'path';

import { API_HANDLERS_FOLDER } from 'constants/paths';

export const getNextHandlerRelativePath = (path: string): string =>
  './' + join(API_HANDLERS_FOLDER, path.replace(/^pages\/api\//, ''));
