import fse from 'fs-extra';
import path from 'path';
import glob from 'glob';

function find(pattern: string) {
  const result = glob.sync(pattern, {
    nodir: true,
    ignore: './**/node_modules/**',
  });
}

export default {
  find,
};
