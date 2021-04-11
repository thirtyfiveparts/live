import {
  listProjects,
  printBins,
  sectionHeaderRepoBinsFromRepoRoot,
} from '@live/cli-core/src/printers'
import findProjects from '@live/find-projects'
import {findBin} from '@live/find-projects'
import runRepoBin from '../runners/repo-bin'
import exit from '@src/modules/exit'

export default async function ({
  runInRepoRoot,
  config,
  cwd,
  pargv,
  project,
  repoRoot,
}) {
  let targetCwd = runInRepoRoot ? repoRoot : cwd
  let binToRun = pargv[0]
  let binArgs = pargv.slice(1)

  if (!binToRun) {
    const projects = await findProjects({config, cwd: repoRoot})
    console.log(sectionHeaderRepoBinsFromRepoRoot(project))
    printBins(projects.filter(p => p.bins))
    return exit(1)
  }

  await runRepoBin({
    config,
    cwd,
    project,
    binToRun,
    binArgs,
    repoRoot,
  })
}
