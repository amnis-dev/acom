// import fse from 'fs-extra';
import path from 'path';
import glob from 'glob';

export interface FilePath {
  /**
   * Full path including the file.
   */
  file: string;

  /**
   * Directory containing the file.
   */
  directory: string;

  /**
   * Base name of the file: `file.ext`
   */
  basename: string;
}

function find(basepath: string, filepattern: string): FilePath[] {
  const results = glob.sync(`${basepath}/**/${filepattern}`, {
    nodir: true,
    ignore: `${basepath}/**/node_modules/**`,
  });

  return results.map<FilePath>((result) => ({
    file: result,
    directory: path.dirname(result),
    basename: path.basename(result),
  }));
}

export default {
  find,
};
