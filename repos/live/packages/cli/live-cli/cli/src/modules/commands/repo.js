import exit from '@src/modules/exit'
import {runCommand} from '@src/modules/commands/app'
import findProjects from '@live/find-projects'
import _ from 'lodash'
import {showRepoHelp} from '@live/cli-core/src/printers/help'

export default async function handleRepoCommand({
  cmd,
  config,
  cwd,
  repoRoot,
}) {
  const projects = await findProjects({config, cwd})

  const project = _.find(projects, {root: '.'})

  let res

  // prettier-ignore
  res = await validate()
  if (!res) return exit(1)

  // TODO(vjpr): Is this right?
  const fullCmd = [cmd.split(' ')]

  await runCommand({cmd, fullCmd, project, repoRoot, cwd, config})

  async function validate() {
    if (!cmd) {
      const projectRoot = project.root
      await showRepoHelp(project, {
        repoRoot,
        repoOnly: true,
        cwd,
        projectRoot,
        config,
      })
      return exit(1)
    }

    return true
  }
}
