import {processManager} from '../process-manager'
import runNpmScript from '../runners/npm-script'

export default class Stack {
  projects: []
  stackName: any
  repoRoot: any

  constructor(stackName, repoRoot) {
    this.projects = []
    this.stackName = stackName
    this.repoRoot = repoRoot
  }

  addProject(p) {
    this.projects.push(p)
  }

  async up({instanceName}) {
    await processManager.init()
    const {repoRoot} = this

    console.log('Running stack', this.stackName)

    // DEBUG
    const projects = [this.projects[0]]

    for (const project of projects) {
      // Check if already running.

      // live app <app-name> run dev
      const npmRunCommand = getUpCommand(project)

      // TODO(vjpr): Check `repoRoot` as well.
      const projectRoot = project.absRoot
      const config = {
        project: {
          pkgName: project.name,
          pkgDir: projectRoot,
          cmd: npmRunCommand,
          repoRoot,
        },
        stack: {
          name: this.stackName,
          instanceName,
        },
      }

      const proc = await processManager.findProcessByStack(config)
      console.log({proc})
      if (proc) {
        console.log('Process is already running')
        // TODO(vjpr): Print to display.
        continue
      }

      // DEBUG
      await run()

      async function run() {
        // Process is not running. Run it.

        // TODO(vjpr): Need a way to ensure that we don't run a command that then runs live.

        console.log('running process', projectRoot, config)

        await runNpmScript(npmRunCommand, null, {
          repoRoot,
          projectRoot,
          config,
        })
      }
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function getUpCommand(project) {
  // TODO(vjpr): Allow configuring the command using this property.
  //const project.pjsonLiveConfig.commands
  // TODO(vjpr): Check environment somehow. Prod/dev.
  return 'dev'
}

//class Project {
//
//  constructor(opts) {
//    this.opts = opts
//  }
//
//  async npmRun(cmd) {
//
//  }
//
//}
