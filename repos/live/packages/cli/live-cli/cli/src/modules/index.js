import Debug from 'debug'
import {join} from 'path'
import 'hard-rejection/register'
import {perf, step} from '@live/log/es5'
import {parseCliFlags, parseArgs} from './parse-args'
import initBabelRegister from './init-babel-register'
import readConfig from './config'
import CLI from '@src/modules/interactive/cli'
import loadPresetsAndPlugins from '@src/modules/plugins'

// Disabled.
//import npmLifecycle from 'npm-lifecycle'
//import scope from '@vjpr/babel-plugin-console/scope.macro'
//import time from '@live/time.macro'

const cli = (global.liveCliInteractive = new CLI({main}))

const debug = Debug('app')

function test() {
  //scope('test')
}

//
// pargv = process.argv.slice(2)
// E.g.
//   node script.js --foo cmd
//   ['node, 'script.js', '--foo', 'cmd']
//
export default async function main({pargv, completion} = {}) {
  pargv = pargv ?? process.argv.slice(2)

  const originalPargv = pargv

  // Only the flags before the first command.
  const cliFlags = parseCliFlags(pargv, {
    boolean: ['c', 'v'],
    alias: {verbose: 'v'},
  })

  // The rest of the args are an array in `--` I think because of this bug:
  //   https://github.com/yargs/yargs-parser/issues/160
  // We have to do `|| []` because of:
  //   https://github.com/yargs/yargs-parser/issues/161
  const restPargv = cliFlags['--'] || []

  const argv = parseArgs(pargv) // Legacy.

  const repoRoot = findRepoRoot()

  const cwd = getCwd({argv: cliFlags})

  workingDirToCwd({cwd})

  // PERF: This slows things down a lot. Avoid loading babel/register until absolutely necessary.
  //   Hang on, I don't think this is slow here. Its the first ES6 require that will be slow.
  // Avoid if possible! Maybe we should support Node@11 ESM?
  initBabelRegister({cwd}) // jsperf
  // ---

  const config = loadConfig({repoRoot}) // jsperf

  await loadPresetsAndPlugins(config)

  const firstArg = restPargv[0]

  // [bin, bar, --, foo]
  // => [bar, --, foo]
  pargv = restPargv.slice(1)

  //////////////////////////////////////////////////////////////////////////////

  // `config` is passed through to all command executions.
  // Its a convenience.

  // TODO(vjpr): Use `runInfo` instead of adding directly to `config` because
  //   `config` is suppose to be just the live config file.

  config.runInfo = {
    originalPargv,
    pargv,
    cliFlags,
    completion,
    repoRoot,
    cwd,
  }

  config.cliFlags = cliFlags

  // Just so we can easily pass it through to the entire app without using a global.
  config.completion = completion

  //////////////////////////////////////////////////////////////////////////////

  if (completion) {
    // TODO(vjpr): If cli is active we need to disable all perf commands.
    perf.config({shouldPrint: false})
  }

  //////////////////////////////////////////////////////////////////////////////

  if (completion?.fragment === 1) {
    const commands = getCommands({pargv, config, cwd, repoRoot})
    return showCompletion({completion, commands})
  }

  if (!firstArg) {
    const {showGlobalHelp} = await import('@live/cli-core/src/printers/help')
    return await showGlobalHelp()
  }

  const commands = getCommands({pargv, config, cwd, repoRoot})

  if (commands[firstArg]) {
    return await commands[firstArg]()
  } else {
    const {showGlobalHelp} = await import('@live/cli-core/src/printers/help')
    return await showGlobalHelp()
  }
}

////////////////////////////////////////////////////////////////////////////////

function showCompletion({completion, commands}) {
  const firstArgs = Object.keys(commands)
  completion.reply(firstArgs)
}

function getCwd({argv}) {
  const cwd = argv.cwd || process.cwd()
  return cwd
}

function workingDirToCwd({cwd}) {
  if (cwd !== process.cwd()) process.chdir(cwd)
}

function findRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  return path.dirname(rootPath)
  //return process.cwd()
  if (!rootPath) {
    throw `Couldn't find root path`
  }
}

function loadConfig({repoRoot}) {
  const config = readConfig({repoRoot})
  return config
}

function getCommands({pargv, config, cwd, repoRoot}) {
  const handlerArgs = {
    pargv,
    config,
    cwd,
    repoRoot,
  }
  return {
    daemon: async () => {
      const {default: handleDaemon} = await import('./commands/daemon')
      await handleDaemon(handlerArgs)
    },
    watch: async () => {
      const {default: handleWatch} = await import('./commands/watch')
      await handleWatch(handlerArgs)
    },
    docs: async () => {
      const {handleDocsCommand} = await import('./commands/docs')
      await handleDocsCommand(handlerArgs)
    },
    // Stack is multiple processes required to run one app (e.g. backend and frontend).
    stack: async () => {
      const {handleStackCommand} = await import('./commands/stack')
      await handleStackCommand(handlerArgs)
    },
    app: async () => {
      const {handleAppCommand} = await import('./commands/app')
      await handleAppCommand(handlerArgs)
    },
    pkg: async () => {
      const {handleAppCommand} = await import('./commands/app')
      await handleAppCommand({...handlerArgs, packageOrApp: 'package'})
    },
    'bin-root': async () => {
      const {default: runBin} = await import('./commands/bin')
      await runBin(handlerArgs)
    },
    bin: async () => {
      const {default: runBin} = await import('./commands/bin')
      await runBin(handlerArgs)
    },
    list: async () => {
      const {default: handleList} = await import('./commands/list')
      await handleList({config, cwd})
    },
    repo: async () => {
      const cmd = pargv[0]
      const {default: handleRepoCommand} = await import('./commands/repo')
      await handleRepoCommand({cmd, config, cwd, repoRoot})
    },

    i: async () => {
      cli.init()
      cli.show()
    },
    ps: async () => {
      // TODO(vjpr): Show all processes that live is managing.
      //   Maybe it would be better as an interactive app.
      //   See dry for Docker as inspiration.
      const {handleCommand} = await import('./commands/proc')
      await handleCommand({...handlerArgs})
    },
  }
}
