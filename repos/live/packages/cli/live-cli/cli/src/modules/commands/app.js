import Debug, {log} from '@live/log/es5'
import findProjects from '@live/find-projects'
import getRunContext from '../run-context'
import {findProjectByName, resolveCmd} from '@live/find-projects'
import {showHelp} from '@live/cli-core/src/printers/help'
import {listProjects, listPackages} from '@live/cli-core/src/printers'
import runProjectBin from '../runners/project-bin'
import runNpmScript from '../runners/npm-script'
import runExec from '../runners/run-exec'
import {collectCommands} from '@live/cli-core/src/livefile'
import exit from '@src/modules/exit'
import {parseArgs, parseArgsHalt} from '@src/modules/parse-args'
import {processManager} from '../process-manager'

const debug = Debug('app')

export async function handleAppCommand({
  pargv,
  config,
  cwd,
  repoRoot,
  packageOrApp: pkgOrApp,
}) {
  pkgOrApp = pkgOrApp || 'app'

  let res

  ////////////////////////////////////////////////////////////////////////////////

  // Args parsing.

  const {
    remainingPargv,
    appName, // Actually more like an "app selector".
    fullCmd,
    cmd,
    cmdArgv,
    cmdArgs,
    firstCmdArg,
    restCmdArg,
  } = parseAppArgs(pargv)

  ////////////////////////////////////////////////////////////////////////////////

  //const repoRoot = process.cwd()

  // First argument is `projectRoot`.
  const project = await findProjectByName(appName, config)
  debug({project})

  const projectRoot = project?.absRoot

  config = {
    ...config,
    project: {
      pkgName: project?.name,
      pkgDir: projectRoot,
      repoRoot,
    },
  }

  // prettier-ignore
  res = await validate()
  if (!res) return exit(1)

  if (config.completion) return

  // start, run, bin
  res = await handleBuiltInCommands()
  if (res) return exit(0)

  await runCommand({cmd, fullCmd, project, repoRoot, cwd, config})

  //////////////////////////////////////////////////////////////////////////////

  async function validate() {
    if (!appName) {
      const projects = await findProjects({config, cwd})
      if (config.completion) {
        config.completion.reply(
          // We could also use `p.name`.
          projects.filter(p => p.isApp || p.isAppTemplate).map(p => p.dirName),
        )
        return exit(1)
      }
      console.log(
        `No ${pkgOrApp}-name specified. Printing list of ${pkgOrApp}s.`,
      )
      printUsage()

      if (pkgOrApp === 'app') {
        // TODO(vjpr): Memoize findProjects - its already cached though.
        listProjects({projects, config, cwd})
      } else {
        listPackages({projects, config, cwd})
      }

      return exit(1)
    }

    if (!project) {
      if (config.completion) return exit(1)
      if (pkgOrApp === 'app') {
        console.log(
          `${pkgOrApp} not found - maybe it exists but is not an app. apps must have live.app=true in their pjson`,
        )
      } else {
        console.log(`${pkgOrApp} not found.`)
      }
      printUsage()
      console.log(`Run 'live ${pkgOrApp}' to see a lists of ${pkgOrApp}s`)
      return exit(1)
    }

    if (!cmd) {
      if (config.completion) {
        // NOTE: zsh sorts them in alphabetical order.
        const allCommands = [
          ...Object.keys(getBuiltInCommands()),
          ...getLivefileCommands({project, repoRoot}),
        ]
        config.completion.reply(allCommands)
        return exit(1)
      }
      await showHelp(project, {
        repoRoot,
        packageOrApp: pkgOrApp,
        cwd,
        projectRoot,
        config,
      })
      return exit(1)
    }
    return true
  }

  function printUsage() {
    console.log(`Use: live ${pkgOrApp} <${pkgOrApp}-name>`)
  }

  function getBuiltInCommands() {
    return {
      exec: async () => {
        await runExec(cmdArgv.join(' '), {repoRoot, projectRoot, config})
        return true
      },
      bin: async () => {
        // We will run one your the bins we have found in the repo with cwd set to this app's root.
        const binToRun = firstCmdArg
        const binArgStr = restCmdArg
        const cwd = project.absRoot

        // TODO(vjpr): This may be slow, only run if necessary.
        const projects = await findProjects({config, cwd: repoRoot})
        // --
        await runProjectBin({
          binToRun,
          binArgStr,
          config,
          cwd,
          project,
          projects,
          repoRoot,
        })
        return true
      },
      start: async () => {
        // Run `npm start`.
        // TODO(vjpr): There is an api from npm for running scripts that we might want to use.
        //await npmLifecycle('start', )
        // ---
        const argsAfterNpmScriptName = cmdArgv
        await runNpmScript('start', argsAfterNpmScriptName.join(' '), {
          projectRoot,
          config,
        })
        return true
      },
      run: async () => {
        // Run an npm script with npm.

        const npmRunCommand = firstCmdArg // npm run <cmd>

        if (!npmRunCommand) {
          // See https://github.com/npm/cli/blob/ab3c62aa83375a7d4a21e396129ae5679ee86646/lib/run-script.js

          // TODO(vjpr): Should we show our own npm run list?
          //   We would be lacking command completion, json/parseable output.
          await runNpmScript('', '', {projectRoot, config})
          return true
        }

        const argsAfterNpmScriptName = restCmdArg
        await runNpmScript(npmRunCommand, argsAfterNpmScriptName.join(' '), {
          projectRoot,
          config,
        })
        return true
      },
      killall: async () => {
        // Kill any process belonging to this app.
        await processManager.init()
        const procs = await processManager.findProcessesByProject(project.name)
        console.log(procs)
        for (const proc of procs) {
          console.log('Killing', proc.pid)
          process.kill(proc.pid)
          console.log('Killed')
        }
      },
    }
  }

  async function handleBuiltInCommands() {
    const commands = getBuiltInCommands()
    if (commands[cmd]) return await commands[cmd]()
  }
}

function getLivefileCommands({project, repoRoot}) {
  let commands = collectCommands({project, repoRoot})
  // TODO(vjpr): Remove duplicates that are unreacheable.
  // TODO(vjpr): Only show available commands.
  //commands = commands.filter(c => c.available)
  // --
  return commands.map(c => c.name)
}

export async function runCommand({
  cmd,
  fullCmd,
  project,
  repoRoot,
  cwd,
  config,
}) {
  if (cmd) debug.info(`Trying to run command: "${cmd}"`)

  const projectRoot = project.absRoot

  // This is passed to the livefile function, NOT the app task.
  const ctx = getRunContext({cwd, repoRoot, projectRoot, config})

  let {fn, cmdStr, source, sourcePath, sourceObj} = await resolveCmd({
    project,
    cmd,
    repoRoot,
    ctx,
  })

  if (!cmdStr && !fn) {
    if (!config.completion) {
      console.log('Command not found')
    }
    return exit(1)
  }

  if (cmdStr) {
    // The user passed a simple string as the command.
    fn = () => runExec(cmdStr, {repoRoot, projectRoot, config})
  }

  // prettier-ignore
  const commandArgs = prepareCommandArgs()

  // OUT-OF-DATE
  // Passed to the task.
  // args = remaining commands
  // e.g. `live app main server foo` -> `foo`
  // OUT-OF-DATE

  fn(commandArgs)

  //////////////////////////////////////////////////////////////////////////////

  // TODO(vjpr): This slicing is `live app foo` specific.
  //   It needs to work for `live repo`
  function prepareCommandArgs() {
    log(
      `Running '${fullCmd.join(' ')}' for app '${project.dirName}' (${
        project.name
      }) (${project.root})`,
    )
    //const sourceRelPath = path.relative(repoRoot, sourcePath)
    debug(`Source ${source} ${sourcePath}`) // TODO(vjpr): Make this debug.
    console.log('---')

    return {
      project,
      //args: argv._.slice(3),
      //argv,
      //argvStart, // TODO(vjpr): I don't think we need this.
      //argvEnd: taskArgsArr,
      source: sourceObj,
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function parseAppArgs(pargv) {
  let remainingPargv

  // process.argv = live app foo run bar -- baz
  // E.g. pargv = foo run bar -- baz

  // NOTE: Naming convention:
  // xArgv = process.argv array
  // xArgs = {_: [], flag: true}

  const appName = pargv[0] // foo

  remainingPargv = pargv.slice(1) // run bar -- baz
  const appFlags = parseArgsHalt(remainingPargv)

  remainingPargv = appFlags._
  const fullCmd = remainingPargv // run bar -- baz
  const cmd = remainingPargv[0] // run

  remainingPargv = remainingPargv.slice(1)
  const cmdArgv = remainingPargv // bar -- baz
  const cmdArgs = parseArgs(remainingPargv)

  // NOTE: We don't use `cmdArgs._[0]` because we might want to check that the first arg is a text.
  const firstCmdArg = cmdArgv[0]
  const restCmdArg = cmdArgv.slice(1)

  //console.log({appName, cmd, cmdArgv, cmdArgs, firstCmdArg, restCmdArg})

  return {
    remainingPargv,
    appName,
    fullCmd,
    cmd,
    cmdArgv,
    cmdArgs,
    firstCmdArg,
    restCmdArg,
  }
}
