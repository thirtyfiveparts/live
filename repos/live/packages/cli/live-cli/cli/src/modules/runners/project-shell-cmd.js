import runShell from './run'
import _ from 'lodash'
import {spawn, exec} from 'promisify-child-process'
import objectDiff from 'object-diff'
import path, {join} from 'path'
import getShellEnvVars from './util/get-shell-env-vars'
import dargs from 'dargs'
import Debug, {log} from '@live/log/es5'
import exit from '@src/modules/exit'
import indent from 'indent-string'
import c from 'chalk'
import {parseArgs} from '@src/modules/parse-args'

const debug = Debug('@live/cli')

// _opts = {envPrependProcessEnv, env}
export default async function(
  cmd,
  _opts = {},
  {repoRoot, projectRoot, cwd, config},
) {
  const {opts: spawnOpts, env, envOverrides} = await prepareOptions(_opts, {
    repoRoot,
    projectRoot,
    cwd,
  })

  const debugObj = {cmd, projectRoot, repoRoot, customEnv: env, envOverrides}
  printEnv(debugObj)

  const cmdArgs = prepareCmdArgs({cmd})

  cmd += ' ' + cmdArgs.join(' ')

  const info = {runType: 'project-shell-cmd', projectRoot}

  await runShell(cmd, spawnOpts, config, {info})
}

function isEmptyObject(obj) {
  return Object.entries(obj).length === 0 && obj.constructor === Object
}

function printEnv(debugObj) {
  debug('running', debugObj)
  log()
  log(`Running with custom env vars (compared to your shell's vars):`)
  log(c.grey(`NOTE: Some of these may be listed here because your terminal's env is stale. Open a new terminal.`))
  log(indent(formatEnvVars(debugObj.customEnv), 2))
  if (!isEmptyObject(debugObj.envOverrides)) {
    log('The following shell env vars are being overridden:')
    log(indent(formatEnvVarOverrides(debugObj.envOverrides), 2))
  }

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

function formatEnvVars(vars) {
  let str = ''
  Object.entries(vars).map(([k, v]) => {
    str += c.grey.bold(k + ': ') + c.grey(v) + '\n'
  })
  return str
}

function prepareCmdArgs({cmd}) {

  const parsedArgs = parseArgs(process.argv)

  let args = []

  // Manually pass through some options.

  // E.g. run dev --live.iprofile
  //const {profile, iprofile} = argv.live
  //console.log({argv})
  //const manualPassthroughArgs = dargs({profile, iprofile})
  //console.log({manualPassthroughArgs})
  //args.push(...manualPassthroughArgs)
  // --

  const remainingArgs = parsedArgs['--'] || []

  // E.g. run dev -- bar --foo
  args.push(...remainingArgs)
  // --

  // TODO(vjpr): Trim args.
  //const trimmedProcessArgv = process.argv.find(cmd)
  // --

  return args
}

async function prepareOptions(opts, {repoRoot, projectRoot, cwd}) {
  // We handle process.env separately like this because we don't want to
  //   clutter debug logs with the entirety of process.env.
  let {envPrependProcessEnv, env} = opts
  env = env ?? {}
  delete opts.envPrependProcessEnv
  delete opts.env

  // TODO(vjpr): Check performance.
  const shellEnv = await getShellEnvVars()

  const {vars: cliEnv, overrides: envOverrides} = getCliEnvVars(shellEnv)

  exitIfProcessEnvPassedToRun(env, shellEnv)

  let mergedOpts = {
    //stdio: 'inherit', // We will handle this in `run`.
    cwd: cwd || projectRoot,
    ...opts,
  }

  env = overrideProcessEnvWithCliEnv(env, cliEnv)

  mergedOpts.env = envPrependProcessEnv ? {...process.env, ...env} : env

  return {opts: mergedOpts, env, envOverrides}
}

////////////////////////////////////////////////////////////////////////////////

function overrideProcessEnvWithCliEnv(env, cliEnv) {
  // NOTE: This allows us to pass in env vars from cli.
  //   Because we prepend process.env, i.e. `{...process.env, ...env}`.
  //   We want:
  //   1. process.env
  //   2. programmatic env
  //   3. cli env (but this is changing how env works - not sure its a good idea.)
  //     But its confusing for the user to have their env vars not picked up.
  // TODO(vjpr): I don't want to rely on cliEnv right now because it could be slow, and it might be flaky on different machines.
  if (process.env.NODE_ENV !== 'production') {
    return {...env, ...cliEnv}
  } else {
    return env
  }
}

function exitIfProcessEnvPassedToRun(env, shellEnv) {
  if (_.isMatch(env, shellEnv)) {
    console.error(
      `ERROR: In your livefile, run's 'env' arg contains 'process.env'. Please use 'envPrependProcessEnv' instead of merging 'process.env' yourself.`,
    )
    console.trace('Stack trace:')
    return exit(1)
  }
}

function getCliEnvVars(shellEnv) {
  const processEnv = global.origProcessEnv || process.env

  let cliEnv = objectDiff(shellEnv, processEnv)
  cliEnv = filterVars(cliEnv)

  // Exist in both shell and process, but are different.
  let overriddenVars = objectDiffOverrides(shellEnv, processEnv)
  overriddenVars = filterVars(overriddenVars)

  function filterVars(vars) {
    // Filter out env vars that change often, or between invocation, etc..
    vars = _.omitBy(vars, (v, k) => ignoreEnvVars.includes(k))
    vars = _.omitBy(vars, (v, k) => {
      return k.endsWith('CHROME_SOCKET')
    })
    return vars
  }

  // NOTE: This could also include `process.env` vars that have been set in live-cli, such as `BABEL_CACHE_PATH`.
  debug.debug('ENV vars set at CLI:')
  debug.debug(cliEnv)

  return {vars: cliEnv, overrides: overriddenVars}
}

// TODO(vjpr): Make this list configurable.
const ignoreEnvVars = [
  'NODE_PATH',
  'TERM_PROGRAM',
  'SHELL',
  'TERM',
  'TMPDIR',
  'Apple_PubSub_Socket_Render',
  'TERM_PROGRAM_VERSION',
  'TERM_SESSION_ID',
  'USER',
  //'QUIP_KEY',
  'SSH_AUTH_SOCK',
  '__CF_USER_TEXT_ENCODING',
  'PATH',
  'LANG',
  'ITERM_PROFILE',
  'XPC_FLAGS',
  'XPC_SERVICE_NAME',
  'COLORFGBG',
  'SHLVL',
  'ITERM_SESSION_ID',
  'LC_CTYPE',
  'LC_TERMINAL_VERSION',
  'LC_TERMINAL',
  'DISPLAY',
  'COLORTERM',
  '_',
  // See https://github.com/zeit/hyper/issues/482
  'SECURITYSESSIONID',
  'COMMAND_MODE', // node = unix2003
  'SQLITE_EXEMPT_PATH_FROM_VNODE_GUARDS',
  'MANPATH',
]

////////////////////////////////////////////////////////////////////////////////

function objectDiffOverrides(a, b) {
  // Vars that are overridden (instead of new).
  const keysThatExistInBoth = _.intersection(Object.keys(a), Object.keys(b))
  const overiddenEntries = _.filter(
    keysThatExistInBoth,
    key => a[key] !== b[key],
  )
  const diff = overiddenEntries.map(k => [k, {old: a[k], new: b[k]}])
  return _.fromPairs(diff)
}
