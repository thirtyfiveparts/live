//import Watcher from '@src/modules/watch/watchman'
import debouncePromise from 'debounce-promise'
import {getWorkspacePackages} from '@live/get-workspace-pkgs'
import {processManager} from '@src/modules/process-manager'
import runProjectBin from '@src/modules/runners/project-bin'
//import {getWorkspacePackages} from '@live/get-workspace-pkgs'
import readConfig from '../config'
import findProjects from '@live/find-projects'

export default async function watcher() {
  console.log('WATCH')

  const cwd = process.cwd()
  const repoRoot = findRepoRoot()

  const config = loadConfig({repoRoot})
  //const config = {cliFlags: {}}

  const projects = await findProjects({config, cwd: repoRoot})

  const watchRegistry = []

  projects.filter(project => {
    const {pjsonLiveConfig, bins} = project
    const watches = pjsonLiveConfig?.watch?.watches
    watches?.map(watch => {
      watchRegistry.push({
        project,
        watch,
      })
    })
  })

  for (const entry of watchRegistry) {
    await run(entry, {repoRoot, cwd, projects, config})
  }
}

////////////////////////////////////////////////////////////////////////////////

async function run(entry, {repoRoot, cwd, projects, config}) {
  const {bin, watch, project} = entry

  // Commands
  const defaultBin = Object.keys(project.bins)?.[0]
  const binCommand = watch.bin === 'default' ? defaultBin : watch.bin
  const npmCommand = watch.npm
  const scriptCommand = watch.script
  ////////////////////

  // TODO(vjpr): Check if already running.
  //await processManager.init()
  // --

  // TODO(vjpr): Open a stream of the combined logs of all watch processes prefixed by their process name.
  //   This should be a generic function of the process manager.

  // TODO(vjpr): It would be cleaner if we were in complete control of the scheduler. We could implement a cleaner logging and dependencies etc. Gulp orchestrator.
  //   Thing is...don't overcomplicate it. We actually don't have any dependencies.
  //   And separate process are more scalable, if not a little more difficult to manage.
  //   We can't debounce and show ticks as to the processes we are running.
  //   Ideally we don't want too much crazy shit going on.
  //   And also, webpack is the biggest watcher of them all and will usually be in a separate process.
  //   And remember, this is for repo-wide watchers, not project-based - we are not touching that. So there aren't that many.

  if (binCommand) {
    const binArgStr = ''
    const binToRun = binCommand
    const runOpts = {
      config,
      cwd,
      binToRun,
      binArgStr,
      project,
      projects,
      repoRoot,
    }
    console.log('running', binToRun)
    await runProjectBin(runOpts)
    return
  }

  // TODO(vjpr): Script and npm run options.
}

////////////////////////////////////////////////////////////////////////////////

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
