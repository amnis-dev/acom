import fse from 'fs-extra';
import {
  rollup, RollupOutput, OutputAsset, OutputChunk,
} from 'rollup';
import { rollupLibraryConfig } from '../config/rollup.library.config';
import c from './console';

/**
 * Pack options.
 */
export interface PackOptions {
  bundleName?: string;
  rootDir?: string;
  dryRun?: boolean;
}

/**
 * Pack method type.
 */
export type Pack = (
  entry: string,
  out: string,
  tsconfig: string,
  options: PackOptions
) => Promise<void>;

/**
 * Writes bundle output.
 */
function writeOutput(output: RollupOutput, outDir: string, dryRun: boolean) {
  /**
     * Save the outputs.
     */
  output.output.every((data) => {
    const { fileName } = data;
    if (dryRun) {
      c.item('Create:', fileName);
      return true;
    }

    if (data.type === 'asset') {
      const { source } = data as OutputAsset;
      fse.writeFileSync(`${outDir}/${fileName}`, source);
    }

    if (data.type === 'chunk') {
      const { code } = data as OutputChunk;
      fse.writeFileSync(`${outDir}/${fileName}`, code);
    }

    return true;
  });
}

/**
 * Packs up a TypeScript project.
 */
export const pack: Pack = async (
  entry,
  out,
  tsconfig,
  {
    bundleName = 'bundle',
    rootDir = '.',
    dryRun = false,
  },
) => {
  try {
    /**
     * Create the output directory if it doesn't exist.
     */
    if (!fse.pathExistsSync(out)) {
      if (!dryRun) {
        fse.mkdirSync(out);
      } else {
        c.item('Create:', out);
      }
    }

    const rollupOptions = rollupLibraryConfig(tsconfig, { rootDir, input: entry, output: out });
    const bundle = await rollup(rollupOptions);

    const moduleOutput = await bundle.generate({
      file: `${out}/${bundleName}.module.js`,
      format: 'module',
      minifyInternalExports: true,
    });
    const umdOutput = await bundle.generate({
      name: bundleName,
      file: `${out}/${bundleName}.umd.js`,
      format: 'umd',
      minifyInternalExports: true,
    });

    writeOutput(moduleOutput, out, dryRun);
    writeOutput(umdOutput, out, dryRun);

    await bundle.close();
  } catch (error) {
    console.error(error);
  }
};

export default pack;
