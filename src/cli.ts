import yargs from 'yargs/yargs';
import { acom } from './acom';
import { build, BuildOptions } from './build';

const nop = () => { /** No operation */ };

export async function cli(argv: string[]) {
  await yargs(argv)
    .command(
      '$0',
      'The default command',
      nop,
      () => {
        acom();
      },
    )
    /**
     * ================================================================================
     * BUILD COMMAND
     * ------------------------------------------------------------
     */
    .command(
      'build [path]',
      'Bundles and outputs a project as either a library or deployable node service',
      (y) => y
        .positional('path', {
          type: 'string',
          description: 'Path containing the Node.js packages.',
          default: '.',
        })
        .option('type', {
          alias: 't',
          type: 'string',
          description: 'Type of package to build.',
          choices: ['library', 'service'],
          default: 'library',
        })
        .option('entry', {
          alias: 'e',
          type: 'string',
          description: 'Entry file for the bundles.',
          default: 'src/index.ts',
        })
        .option('out', {
          alias: 'o',
          type: 'string',
          description: 'Bundle and transpile output path.',
          default: '.dist',
        })
        .option('dry-run', {
          type: 'boolean',
          description: 'Dry run the build.',
          default: false,
        })
        .help(),
      async ({
        path, entry, out, type, dryRun,
      }) => {
        await build({
          path,
          type: type as BuildOptions['type'],
          entry,
          out,
          dryRun,
        });
      },
    )
    .help()
    .argv;
}

export default cli;
