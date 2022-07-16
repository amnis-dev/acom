import { rollup } from 'rollup';
import rollupLibraryConfig from './config/rollup.library.config';

export interface BuildOptions {
  type?: 'library' | 'service';
}

export type Build = (options: BuildOptions) => Promise<void>;

/**
 * Builds a project.
 */
export const build: Build = async () => {
  try {
    const bundle = await rollup(rollupLibraryConfig());
    console.log(bundle.watchFiles);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
