import { rollup, OutputOptions } from 'rollup';
import rollupLibraryConfig from './config/rollup.library.config';
import c from './console';

export interface BuildOptions {
  type?: 'library' | 'service';
}

export type Build = (options: BuildOptions) => Promise<void>;

/**
 * Builds a project.
 */
export const build: Build = async ({ type = 'library' }) => {
  c.banner('ACOM BUILD');
  c.item('Build type:', type);
  c.nl();
  try {
    const rollupOptions = rollupLibraryConfig();
    const bundle = await rollup(rollupOptions);
    console.log(bundle.watchFiles);
    const { output } = await bundle.write(rollupOptions.output as OutputOptions);
    console.log({ output });
    await bundle.close();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
