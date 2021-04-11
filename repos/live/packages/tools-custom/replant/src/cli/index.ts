import Debug from 'debug'
import _ from 'lodash'
import getCwd from 'cwd'
import yargs from 'yargs'
// TODO(vjpr): Read from `rc` file on disk.
import {parseCLI} from '@src/cli/parse-cli'
import {run} from '@src/main'
import {watch} from '@src/watch'
//import Promise, {promisify} from 'bluebird'

const debug = Debug('replant')

//
// This is the entry script for the CLI utility.
//

//
// For quick testing:-

//
// cd ~/dev-mono/thirtyfive-test-20210318Thu
// nodemon -x replant -w ~/dev-live/replant/lib -e js -q
//

export function getConfig(opts) {
  return _.defaults(opts, {
    replantFileName: '.replant.yml',
    replantFileNameHelp: 'replant file',
    replantFileNameCurrent: '.replant.current.yml',
    //replantFileNameHelp: `'${replantFileName}'`,
  })
}

export async function cli(args: Array<string>, opts = {}) {
  if (!args) args = process.argv

  opts = getConfig(opts)

  const {processArgv, replantFileName, replantFileNameCurrent, replantFileNameHelp} = opts

  const argv = parseCLI({args, replantFileName, replantFileNameCurrent, replantFileNameHelp})

  debug('yargs', argv)

  opts = _.defaults(opts, {
    quiet: argv.q,
    cwd: argv.cwd || getCwd(),
    init: argv.i,
    reset: argv.r,
    commit: argv.c,
    dryRun: argv.d,
    script: argv.s,
    watch: argv.w,
    debug: argv.debug,
  })

  await watch(opts)

}
