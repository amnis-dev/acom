import chalk from 'chalk';
import figlet from 'figlet';

const l = console.log;

function nl(lines = 1) {
  for (let i = 0; i < lines; i++) {
    console.log(' ');
  }
}

function em(text: string) {
  l(chalk.blue.bold(text));
}

function banner(text: string) {
  const bannerText = figlet.textSync(text, { font: '3D-ASCII' });
  const lineLength = bannerText.slice(0, bannerText.indexOf('\n')).length;
  l(chalk.blue('='.repeat(lineLength)));
  nl(2);
  l(chalk.blue(bannerText));
  l(chalk.blue('-'.repeat(lineLength)));
  nl(1);
}

function log(text: string) {
  l(text);
}

function item(title: string, text: string) {
  l(`${chalk.blue.bold(title)} ${text}`);
}

export default {
  nl,
  em,
  banner,
  log,
  item,
};
