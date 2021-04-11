// MIGRATED

const yargs = require('yargs')

// TODO(vjpr): Option to remove empty dirs instead of adding `.keep`.
export function parseCLI({args, replantFileName, replantFileNameHelp}) {
  const argv = yargs
    .usage('Usage: $0 <option>')
    .describe('cwd', `Specifies directory to run in.`)
    .describe('i', `Initialize ${replantFileNameHelp}.`)
    .alias('i', 'init')
    .describe('r', `Reset ${replantFileNameHelp} to match current dir structure.\nAlias for -i.`)
    .alias('r', 'reset')
    .describe('c', 'Commit changes.')
    .alias('c', 'commit')
    .describe('d', `Don't make changes to file system, just show diff.`)
    .alias('d', 'dry-run')
    .describe('s', `Specify a JS script to transform the dir structure instead of using '${replantFileName}'.`)
    .alias('s', 'script')
    // DEBUG
    .describe('debug', `Run commit stage even if nothing has changed.`)
    //.check()
    .help('help')
    .parse(args)
  return argv
}
