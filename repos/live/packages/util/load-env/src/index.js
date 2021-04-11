import profile from './profile'
import path, {join} from 'path'
// NOTE: We should be running load-env first, before initializing debug otherwise the .env vars won't be set correctly.
import Debug, {Debug as DebugReal, log} from '@live/log/es5'
import {scode, sevt, spath, spkg} from '@live/log-style/es5'
import tildify from 'tildify'
import yargsParser from 'yargs-parser'
import c from 'chalk'
import indent from 'indent-string'
const debug = Debug('@live/load-env')

export default async function() {
  const appRoot = require('../../app-root')

  // NOTE: This will run for `live-cli` as well as the script it runs because they both use `live-cli-helper`.
  //   Be aware when printing debug messages.

  const appRootTools = join(appRoot, 'tools')

  // .env

  const res = await loadDotEnv({appRoot, appRootTools})

  ////////////////////

  // .debug

  // TODO(vjpr): In the works.
  //const debugEnv = await loadDebugEnv({
  //  appRootTools,
  //})
  //process.env.DEBUG = debugEnv

  ////////////////////

  // TODO(vjpr): Maybe support using the monoroot .env file for easily settinig settings across
  //   the entire monorepo.
}

async function loadDotEnv({appRoot, appRootTools}) {
  // Load environment variables from `.env`.
  // TODO(vjpr): Why not safe?
  //const dotenv = require('dotenv-safe')
  const dotenv = require('dotenv')

  const dotenvExamplePath = join(appRootTools, '.env.example')
  const argv = yargsParser(process.argv.slice(2))
  const {live} = argv
  const flag = live?.profile
  const interactiveFlag = live?.iprofile
  const baseFileName = '.env'
  let dotenvPath = await profile({
    appRootTools,
    dotenvExamplePath,
    flag,
    interactiveFlag,
    baseFileName,
    flagName: 'profile',
  })
  if (!dotenvPath) {
    // Use default.
    dotenvPath = join(appRootTools, '.env')
  }

  const res = dotenv.config({
    silent: true,
    sample: dotenvExamplePath,
    path: dotenvPath,
    debug: true,
  })

  //console.log(process.env.NS, process.env.DEBUG)

  // TODO(vjpr): Handle file not found.
  if (res.error) {
    //console.log('Loading failed. Probably because file is missing which is okay.')
    //console.error(res.error)
    return
  }

  console.log()
  console.log(
    `Env vars loaded from ${spath(
      tildify(dotenvPath),
    )} (will override any other definitions):`,
  )
  if (res.parsed) {
    console.log(indent(formatEnvVars(res.parsed), 2))

    const diff = objectDiffOverrides(process.env, res.parsed)
    if (diff) {
      console.log(
        'The following process.env vars are being overridden by .env:',
      )
      console.log(indent(formatEnvVarOverrides(diff), 2))
    }
  } else {
    console.log(c.grey('No vars'))
  }

  ////////////////////

  // For some reason dotenv is not overriding the DEBUG var - maybe to do with its own debugging capabilities...I don't know.
  //   https://github.com/visionmedia/debug/issues/446#issuecomment-297757933
  if (res.parsed.DEBUG) process.env.DEBUG = res.parsed.DEBUG

  ////////////////////

  // TODO(vjpr): Not needed anymore...we always log it above.
  //const relPath = path.relative(process.cwd(), appRoot)
  //debug.info(`${spath(relPath)}:`)
  //debug.info(
  //  `  - Loading environment variables from ${spath(tildify(dotenvPath))}`,
  //)
  ////////////////////

  //const dotenvExpand = require('dotenv-expand')
  //dotenvExpand(myEnv)

  ////////////////////

  // In case DEBUG was set in .env file, we need to re-init debug.
  // TODO(vjpr): Check debug-env too. The force command didn't work for me last time.
  //DebugReal.enable(process.env.DEBUG)
  //DebugReal.log = console.log.bind(console)
  debug.info('Debug package is using colors:', DebugReal.useColors()) // false when no tty.

  ////////////////////
}

////////////////////////////////////////////////////////////////////////////////

import fromPairs from 'lodash/fromPairs'
import intersection from 'lodash/intersection'
import filter from 'lodash/filter'

function objectDiffOverrides(a, b) {
  // Vars that are overridden (instead of new).
  const keysThatExistInBoth = intersection(Object.keys(a), Object.keys(b))
  // We only override entries that are differ.
  const overiddenEntries = filter(keysThatExistInBoth, key => a[key] !== b[key])
  const diff = overiddenEntries.map(k => [k, {old: a[k], new: b[k]}])
  return fromPairs(diff)
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Extract to @live/log-style.
function formatEnvVars(vars) {
  let str = ''
  Object.entries(vars).map(([k, v]) => {
    str += c.grey.bold(k + ': ') + c.grey(v) + '\n'
  })
  return str
}

function formatEnvVarOverrides(vars) {
  let str = ''
  Object.entries(vars).map(([k, v]) => {
    str += c.grey.bold(k) + '\n'
    str += c.red('  - ' + v.old) + '\n'
    str += c.green('  + ' + v.new) + '\n'
  })
  return str
}

////////////////////////////////////////////////////////////////////////////////

export async function loadDebugEnv({appRootTools}) {
  const dotenvExamplePath = join(appRootTools, '.debug.example')
  const baseFileName = '.debug'
  const argv = yargsParser(process.argv.slice(2))
  const {live} = argv
  const flag = live?.debug
  const interactiveFlag = live?.idebug
  const debugEnvPath = await profile({
    appRootTools,
    dotenvExamplePath,
    flag,
    interactiveFlag,
    baseFileName,
    flagName: 'debug',
    isSimpleList: true,
  })
  return debugEnvPath
}
