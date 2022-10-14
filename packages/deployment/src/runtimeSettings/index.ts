import { writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

import { RUNTIME_SETTINGS_FILE } from 'constants/handlerPaths';

/**
 * From a given serializable data, creates a file in a
 * temporary directory to be moved later and returns its fullpath.
 *
 * `filename` defaults to RUNTIME_SETTINGS_FILE
 */
export const createFileInTempDir = (data: unknown, filename = RUNTIME_SETTINGS_FILE): string => {
  const fullpath = join(tmpdir(), filename);
  writeFileSync(fullpath, JSON.stringify(data));

  return fullpath;
};
