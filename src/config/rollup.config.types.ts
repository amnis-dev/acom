import type { RollupOptions } from 'rollup';

export interface RollupConfigOptions {
  rootDir?: string;
  output?: string;
  input?: string;
}

export type RollupConfigMethod = (tsconfig: string, options: RollupConfigOptions) => RollupOptions;
