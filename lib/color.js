import chalk from 'chalk';
import figlet from 'figlet';

const PREFIX = chalk.greenBright('[⚡ XenoviaBot]');

export const banner = (text = 'Xenovia AI') =>
  chalk.cyanBright(figlet.textSync(text, { font: 'Slant' }));

export const color = (text, clr = 'green') => chalk.keyword(clr)(text);
export const bgcolor = (text, bg = 'black') => chalk.bgKeyword(bg)(text);

export const mylog = (text, clr = 'cyan') =>
  `${PREFIX} ${chalk.keyword(clr)(text)}`;

export const infolog = (text) =>
  `${PREFIX} ${chalk.cyanBright('[INFO]')} ${chalk.white(text)}`;

export const warnlog = (text) =>
  `${PREFIX} ${chalk.yellowBright('[WARN]')} ${chalk.white(text)}`;

export const errorlog = (text) =>
  `${PREFIX} ${chalk.redBright('[ERROR]')} ${chalk.white(text)}`;

export const successlog = (text) =>
  `${PREFIX} ${chalk.greenBright('[OK]')} ${chalk.white(text)}`;

export const chatlog = (from, text) =>
  `${chalk.gray('『')} ${chalk.magentaBright(from)} ${chalk.gray('』')} ${chalk.white(text)}`;