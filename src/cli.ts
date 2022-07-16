import yargs from 'yargs/yargs';
import { acom } from './acom';
import { build } from './build';

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
    .command(
      'build',
      'Bundles and outputs a project as either a library or deployable node service',
      nop,
      async () => {
        await build({});
      },
    )
    .help()
    .argv;
}

export default cli;
