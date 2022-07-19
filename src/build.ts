/* eslint-disable @typescript-eslint/no-explicit-any */
import fse from 'fs-extra';
import nodePath from 'path';
import { execSync } from 'child_process';
import c from './utility/console';
import fop from './utility/fop';
import { pack } from './utility/pack';
import { tsrefOrder, TsrefScore, tsrefScore } from './utility/tsref';

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

  const rootCwd = process.cwd();

  /**
   * Score to determine build order.
   */
  const buildScore: TsrefScore = {};

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
     * Calculates build order based on references in the tsconfig file.
     */
    const score = tsrefScore(tsBuildConfigFile);
    Object.keys(score).forEach((key) => {
      if (buildScore[key]) {
        buildScore[key] += score[key];
      } else {
        buildScore[key] = score[key];
      }
    });

    /**
     * Run the pack method to bundle and output the package.
     */
    return true;
  });

  const buildOrder = tsrefOrder(buildScore);

  // eslint-disable-next-line guard-for-in, no-restricted-syntax
  for (const tsConfigFile of buildOrder) {
    process.chdir(nodePath.dirname(tsConfigFile));
    if (type === 'library') {
      c.item('Transpiling:', nodePath.dirname(tsConfigFile));
      const tscCommand = `${rootCwd}/node_modules/typescript/bin/tsc --project tsconfig.build.json`;
      try {
        execSync(tscCommand);
      } catch (error: any) {
        c.error(`OUTPUT: ${error.output.toString()}`);
        c.error(`STDOUT: ${error.stdout.toString()}`);
        c.error(`STDERR: ${error.stderr.toString()}`);
        process.exit(1);
      }
    }

    if (type === 'service') {
      c.item('Bundling:', nodePath.dirname(tsConfigFile));
      // eslint-disable-next-line no-await-in-loop
      await pack(entry, out, nodePath.basename(tsConfigFile), { rootDir: rootCwd, dryRun });
    }
  }
};
