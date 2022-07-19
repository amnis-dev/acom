import path from 'path';
import fse from 'fs-extra';
import type { CompilerOptions } from 'typescript';

export interface TsConfigReference {
  path: string;
}

export interface TsConfig {
  extends?: string;
  compilerOptions?: CompilerOptions;
  references?: TsConfigReference[];
  include?: string[];
  exclude?: string[];
}

/**
 * TypeScript Reference scoring object.
 * Higher the number = more dependent.
 * More dependent = should be compiled first.
 */
export interface TsrefScore {
  [key: string]: number;
}

/**
 * Orders typescript paths by scores.
 */
export function tsrefOrder(score: TsrefScore): string[] {
  const order = Object.keys(score).sort((a, b) => (score[b] - score[a]));
  return order;
}

/**
 * Returns a reference order score based on a tsconfig file.
 */
export function tsrefScore(tsconfigFile: string, depth = 0): TsrefScore {
  const score: TsrefScore = {
    [path.resolve('.', tsconfigFile)]: depth,
  };
  const tsconfig: TsConfig = fse.readJsonSync(tsconfigFile);
  const tsconfigDir = path.dirname(tsconfigFile);

  const { references } = tsconfig;

  if (!references) {
    return score;
  }

  references.forEach((ref) => {
    const refPath = path.resolve(tsconfigDir, ref.path);
    score[refPath] = score[refPath] ? score[refPath] += depth + 1 : score[refPath] = depth + 1;

    const refScore = tsrefScore(refPath, depth + 1);

    Object.keys(refScore).forEach((key) => {
      if (score[key]) {
        score[key] += refScore[key];
      } else {
        score[key] = refScore[key];
      }
    });
  });

  return score;
}
