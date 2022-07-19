import fse from 'fs-extra';
import c from './utility/console';
import fop from './utility/fop';
import { pack } from './utility/pack';

/**
 * Build options.
 */
export interface BuildOptions {
  /**
   * Type of package to build.
   */
  type?: 'library' | 'service';

  /**
   * Path containing packages to build.
   */
  path?: string;

  /**
   * Entry file for the bundle input.
   */
  entry?: string;

  /**
   * Bundle and transpile output.
   */
  out?: string;

  /**
   * Log output only.
   */
  dryRun?: boolean
}

/**
 * Build method type.
 */
export type Build = (options: BuildOptions) => Promise<void>;

/**
 * Builds a project.
 */
export const build: Build = async ({
  type = 'library',
  path = '.',
  entry = 'src/index.ts',
  out = '.dist',
  dryRun = false,
}) => {
  c.banner('ACOM BUILD');
  c.item('Search path:', path);
  c.item('Build type:', type);
  c.nl();

  /**
   * Search for node packages.
   */
  const paths = fop.find(path, 'package.json');

  c.em('Packages');
  c.list(paths.map((p) => {
    const name = p.directory.split('/')?.at(-1);
    if (name === '.') {
      return '(root)';
    }
    return name || '[error]';
  }));
  c.nl();

  const packPromises: Promise<void>[] = [];
  const rootCwd = process.cwd();

  paths.every((p) => {
    process.chdir(`${rootCwd}/${p.directory}`);
    /**
     * Ensure there is a build tsconfig file.
     */
    const tsBuildConfigFile = 'tsconfig.build.json';
    const tsBuildConfigFileExists = fse.existsSync(tsBuildConfigFile);
    if (!tsBuildConfigFileExists) {
      const tsConfigFileExists = fse.existsSync('tsconfig.json');
      if (!tsConfigFileExists) {
        c.warn(`${p.directory}: No base or build typescript configuration found.`);
        return true;
      }
      if (dryRun) {
        c.log(`Create: ${tsBuildConfigFile}`);
      } else {
        fse.writeJSONSync(tsBuildConfigFile, { extends: './tsconfig' }, { spaces: 2 });
      }
    }

    /**
     * Run the pack method to bundle and output the package.
     */
    packPromises.push(pack(entry, out, tsBuildConfigFile, { rootDir: rootCwd, dryRun }));
    return true;
  });

  await Promise.all(packPromises).then(() => {
    c.em('BUILD COMPLETE');
  });
};
