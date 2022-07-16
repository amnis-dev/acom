import type { RollupOptions } from 'rollup';
import typescript from '@rollup/plugin-typescript';

export default (): RollupOptions => ({
  input: 'src/index.ts',
  output: {
    name: 'test',
    dir: 'lib',
    format: 'module',
  },
  plugins: [typescript()],
});
