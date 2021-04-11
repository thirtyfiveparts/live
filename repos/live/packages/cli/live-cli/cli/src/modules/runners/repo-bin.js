import {
  listProjects,
  printBins,
  sectionHeaderRepoBinsFromRepoRoot,
} from '@live/cli-core/src/printers'
import path, {join} from 'path'
import findProjects from '@live/find-projects'
import exit from '@src/modules/exit'

import {findBin} from '@live/find-projects'
import runExec from '@src/modules/runners/run-exec'

import Debug from 'debug'
const debug = Debug('@live/cli:repo-bin')

export default async function runRepoBin({
  config,
  cwd,
  project,
  binToRun,
  binArgs,
  repoRoot,
}) {
  const projects = await findProjects({config, cwd})

  if (!binToRun) return printHelp()
  const bin = findBin(projects, binToRun)
  if (!bin) {
    console.error(`Could not find bin '${binToRun}'`)
    console.error()
    return printHelp()
  }

  const binPathFromRepoRoot = path.join(bin.project.root, bin.binPath)
  debug('Running', binToRun, binPathFromRepoRoot, {cwd})

  const absBinPath = join(repoRoot, binPathFromRepoRoot)

  await runExec(absBinPath + ' ' + binArgs.join(' '), {
    cwd,
    repoRoot,
    projectRoot: repoRoot,
    config,
  })

  // TODO(vjpr): Run bin with cwd.
  // Should we use `npm` to run it? Nah.

  function printHelp() {
    console.log(sectionHeaderRepoBinsFromRepoRoot())
    // TODO(vjpr): Need to pass in root project!
    printBins([])

    return exit(1)
  }
}
