import json from '@rollup/plugin-json';
import typescript from '@rollup/plugin-typescript';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import type { RollupConfigMethod } from './rollup.config.types';

export const rollupLibraryConfig: RollupConfigMethod = (
  tsconfig,
  {
    rootDir = '.',
    output = '.dist',
    input = 'src/index.ts',
  },
) => ({
  input,
  plugins: [
    json(),
    nodeResolve({
      moduleDirectories: ['node_modules', `${rootDir}/node_modules`],
    }),
    typescript({
      tsconfig,
      outDir: output,
      declarationDir: output,
      declaration: true,
      moduleResolution: 'node',
      outputToFilesystem: true,
    }),
  ],
  onwarn(warning) {
    if (warning.code === 'THIS_IS_UNDEFINED') { return; }
    console.warn(warning.message);
  },
});

export default rollupLibraryConfig;
