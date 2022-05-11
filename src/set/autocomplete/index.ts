import program from '@serverless-devs/commander';
import { CommandError } from '../../error';
import core from '../../utils/core';
import { emoji } from '../../utils/common';
const { colors } = core;
import tabtab from 'tabtab';

const description = `Set analysis action.

    Example:
        $ s set analysis
        $ s set analysis disable
        
${emoji('📖')} Document: ${colors.underline(
  'https://github.com/Serverless-Devs/Serverless-Devs/tree/master/docs/zh/command/set.md',
)}`;

program
  .name('s set autocomplete')
  .helpOption('-h, --help', 'Display help for command')
  .addHelpCommand(false)
  .description(description)
  .parse(process.argv);

(async () => {
  await tabtab.install({
    name: 's',
    completer: 's',
  });
})().catch(err => {
  throw new CommandError(err.message);
});
