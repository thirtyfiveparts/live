//import {spawn, exec} from 'promisify-child-process'
import {spawn, exec} from 'child_process'
import c from 'chalk'
import Debug from 'debug'
import {processManager} from '../process-manager'
import {hri} from 'human-readable-ids'
import fse from 'fs-extra'
import path, {join} from 'path'

const debug = Debug('@live/cli:run')

// info - Info to be stored in the process manager about the process.
//  Used to help identify the process when we list it.
//  Stuff like the cmd, project, repo, etc.
export default async function (
  cmdStr,
  spawnOpts,
  config,
  {info, shouldRunDetached} = {},
) {
  // TODO(vjpr): Read `dryRun` from `config.cliFlags.dryRun`. Or pass through.

  // DEBUG
  //shouldRunDetached = true

  // If running detached the log files will have tons of control chars in them, however
  //   if we pipe these to the screen then we get colors. Otherwise we can't have colors.
  const showTerminalColors = true

  const {dryRun} = config.runInfo?.cliFlags ?? {}

  const cli = global.liveCliInteractive

  // Don't run the command if we are in completion mode.
  if (config.completion) return

  if (showTerminalColors) {
    chalkLibColorSupport(spawnOpts)
    debugLibColorSupport(spawnOpts)
  }

  const logPaths = getLogPaths(info.projectRoot)

  const spawnCmdOpts = {
    shell: true,
    detached: shouldRunDetached,
    //encoding: 'utf8', // Enabling this will capture stdout - not a good idea.
    ...getIOSpawnOpts(shouldRunDetached, info.projectRoot, logPaths),
    ...spawnOpts,
  }

  if (handleDryRun({dryRun, cmdStr, spawnCmdOpts, config})) return

  debug('Running', c.grey(cmdStr))
  debug()

  // I think if we use `spawnCmdOpts.shell` we don't have to pass in `spawnArgs`.
  const spawnArgs = []

  // IMPORTANT: You cannot run anything async (await) until you setup the handlers.
  const child = spawn(cmdStr, spawnArgs, spawnCmdOpts)

  // This is set after we register the process which allows us to pass proc man info to handler functions.
  //   This is because handlers must be set in the same event loop and `await registerProcess` cannot.
  let handlerRef = {}

  // TODO(vjpr): Running `node` REPL not working...

  handleIO(child, cli, shouldRunDetached, logPaths)

  handleSigInt(child)

  handleExit(child, handlerRef)

  //global.liveCliInteractive.hide()
  //global.liveCliInteractive.show()

  // stdout, stderr is not captured.
  // See: https://github.com/jcoreio/promisify-child-process#warning-capturing-output
  // TODO(vjpr): If this is uncommented, a big warning will be shown.
  //const {stdout, stderr, exitCode} = await child

  if (shouldRunDetached) {
    // Don't wait for child process to end before exiting.
    // NOTE: Unref causes our main process to exit, which causes the terminal
    //   to print its prompt which is not a good UX.
    //child.unref()
  } else {
    //const {exitCode} = await child
    //debug('Child killed', exitCode)
  }

  // TODO(vjpr): Maybe we need to make this sync to avoid a process exiting before we get its os proc info.
  const {procManInfo} = await registerProcess(config, info, cmdStr, child)
  handlerRef.procManInfo = procManInfo

  //////////////////////////////////////////////////////////////////////////////
}

function handleDryRun({dryRun, cmdStr, spawnCmdOpts, config}) {
  if (!dryRun && !config.dryRunForPrinting) return false
  console.log('Dry run mode. Not running.')
  console.log(`spawn: ${cmdStr}`)
  const {env, ...printableOpts} = spawnCmdOpts // Removes env.
  printableOpts.env = '<not printing>'
  console.log(printableOpts)
  return true
}

////////////////////////////////////////////////////////////////////////////////

function handleAddressInUse(logMsg) {
  const pattern = `Error: listen EADDRINUSE: address already in use :::(\d+)`
  const [a, match] = logMsg.match(pattern)
  if (match) {
    // TODO(vjpr): Help user find out what is using the port.
    // `lsof -i TCP:${match}`
  }
}

////////////////////////////////////////////////////////////////////////////////

/*
TODO(vjpr): This method prevents TTY. This means the user will encounter differences when running apps.
  Apps should inherit. I think the only reason we don't is so we don't have text running over our prompt on exit.
  And also maybe for REPL support.
  Maybe: https://github.com/Gottox/child_pty
 */
function chalkLibColorSupport(spawnOpts) {
  // So chalk uses colors.
  spawnOpts.env = spawnOpts.env || {}
  if (!('FORCE_COLOR' in spawnOpts.env)) {
    spawnOpts.env.FORCE_COLOR = true // Because of `supports-color` (chalk) checking `process.stdout.isTTY`
    debug(`Adding FORCE_COLOR=true to enable colors in 'chalk'`)
  }
}

function debugLibColorSupport(spawnOpts) {
  if (!('DEBUG_COLORS' in spawnOpts.env)) {
    spawnOpts.env.DEBUG_COLORS = true // Because it does `tty.isatty(process.stderr.fd);`
    debug(`Adding DEBUG_COLORS=true to enable colors in 'debug'`)
    // Also see: DEBUG_HIDE_TTY_DATE
  }
}

async function registerProcess(config, info, cmdStr, child) {
  // TODO(vjpr): Are we already running this process?
  //   We need to get the live app info etc.

  await processManager.init()

  // Uniquely identify processes started by this `live-cli` process.
  // TODO(vjpr): Maybe include child because it only applies to our child processes.
  const liveProcessId = hri.random()

  // Specific info about how the process was started.
  const {originalPargv, pargv, cliFlags, completion, repoRoot, cwd} =
    config.runInfo ?? {}
  const {project, stack} = config
  const {runType, projectRoot} = info
  const procManInfo = {
    // config.runInfo
    originalPargv,
    pargv,
    cliFlags,
    completion,
    repoRoot,
    cwd,
    //
    runType,
    projectRoot, // TODO(vjpr): Move to `config.runInfo`.
    //
    cmdStr,
    //
    // App/Project-related stuff.
    project,
    stack,
    liveProcessId,
  }

  await processManager.registerProcess(child, procManInfo)

  return {procManInfo}
}

////////////////////////////////////////////////////////////////////////////////

function getLogPaths(projectRoot) {
  const logDir = join(projectRoot, 'tmp')
  const files = {
    outFile: join(logDir, 'out.log'),
    errFile: join(logDir, 'err.log'),
    logFile: join(logDir, 'log.log'),
  }
  return files
}

function getIOSpawnOpts(shouldRunDetached, projectRoot, logPaths) {
  if (shouldRunDetached) {
    const {errFile, outFile, logFile} = getLogPaths(projectRoot)
    const combine = true
    fse.ensureFileSync(outFile)
    fse.ensureFileSync(errFile)
    fse.ensureFileSync(logFile)
    const outStream = fse.openSync(combine ? logFile : outFile, 'a')
    const errStream = fse.openSync(combine ? logFile : errFile, 'a')

    // TODO(vjpr): Combine steams into a single file.
    //   I think it needs to be one or the other approach actually...
    //fse.ensureFileSync(logFile)
    //const logStream = fse.openSync(logFile, 'a')
    // ---

    return {
      stdio: ['ignore', outStream, errStream],
      //stdio: ['inherit', 'inherit', 'inherit'] // DEBUG
    }
  }

  return {
    // TODO(vjpr): If we don't inherit, `process.stdout.isTTY=false` in child proc.
    //   See: http://derpturkey.com/retain-tty-when-using-child_proces-spawn/
    //   This prevents chalk using colors.
    //stdio: 'inherit', // Prevents us accessing child.stdout.

    // Piping will make isTTY false, which some packages use to check if they
    // should use terminal colors, like `supports-color`.
    // stdin needs to be inherit or repls such as running just `node` won't work
    // TODO(vjpr): I don't know what it will break though. Maybe we cannot send ctrl+C to process anymore...
    stdio: ['pipe', 'pipe', 'pipe'], // Default.
    //stdio: ['inherit', 'pipe', 'pipe'], // stdin, stdout, stderr
    // --
  }
}

function handleSigInt(child) {
  // Listen for ctrl+c on the parent process.
  // TODO(vjpr): Otherwise our process didn't end. But this prevents exit event being called
  //   which caches our babel/register stuff.
  process.on('SIGINT', function () {
    console.log('@live/cli caught interrupt signal (ctrl+c)')

    console.log('Killing the spawned child')
    child.kill('SIGINT')

    // TODO(vjpr): We cannot run the following because we can't assume it was killed?
    //processManager.notifyProcessExited(child, procManInfo).then()

    // These commands don't allow `@babel/register` to save on exit.
    //child.kill('SIGHUP')
    //child.kill('SIGTERM')
  })
}

function handleExit(child, handlerRef) {
  const {procManInfo} = handlerRef ?? {}
  child.on('close', code => {
    console.log(`child process exited with code ${code}`)
  })
  child.on('exit', function () {
    console.log('Child exited')
    if (!procManInfo) {
      console.warn(
        'Process exited before we got its process information to notify the procman that it exited.',
      )
      return
    }
    processManager.notifyProcessExited(child, procManInfo.liveProcessId).then()
  })
}

// TODO(vjpr): Rename `setupIO`.
function handleIO(child, cli, shouldRunDetached, logPaths) {
  if (shouldRunDetached) {
    return
  }

  const {errFile, outFile, logFile} = logPaths
  fse.ensureFileSync(outFile)
  fse.ensureFileSync(errFile)
  fse.ensureFileSync(logFile)
  const outStream = fse.createWriteStream(outFile)
  const errStream = fse.createWriteStream(errFile)

  // For monitoring - stdio must not be set to `inherit`.
  // TODO(vjpr): Track error messages and report possible fixes.
  child.stdout.on('data', data => {
    if (!cli.log(process.stdout, data)) {
      process.stdout.write(data)
      outStream.write(data)
    }
  })
  child.stderr.on('data', data => {
    if (!cli.log(process.stderr, data)) {
      process.stderr.write(data)
      errStream.write(data)
    }
    const exit = handleTroubleshooting(data)
    if (exit) return
  })

  //child.stdin.pipe(process.stdin)
  //child.stdout.pipe(process.stdout)
  //child.stderr.pipe(process.stderr)
}

////////////////////////////////////////////////////////////////////////////////

function handleTroubleshooting(data) {
  const errString = data.toString()
  const syntaxErrorMsg = `SyntaxError: Cannot use import statement outside a module`
  if (errString.match(syntaxErrorMsg)) {
    const line = '-'.repeat(80)
    const msg = `The above error may be caused by a 'package.json' accidentally created in a sub-directory.`
    const fMsg = `${line}\n${msg}\n${line}`
    // TODO(vjpr): Maybe show an example tree.
    // TODO(vjpr): Maybe this error can be in `cli-helper` instead...
    console.warn(c.yellow(fMsg))
  }
  return false
}
