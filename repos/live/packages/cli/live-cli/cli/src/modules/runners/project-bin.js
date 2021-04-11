import {printBins} from '@live/cli-core/src/printers'
import {sectionHeaderPackageBinsFromPackage, sectionHeaderRepoBinsFromApp} from '@live/cli-core/src/printers'
import {findBin} from '@live/find-projects'
import exit from '@src/modules/exit'
import path, {join} from 'path'
import runExec from '@src/modules/runners/run-exec'
import Debug from 'debug'
const debug = Debug('@live/cli:project-bin')

// TODO(vjpr): Passing arguments!
// TODO(vjpr): Running a bin inside a project.
export default async function runProjectBin({
  config,
  cwd,
  binToRun,
  binArgStr,
  project,
  projects,
  repoRoot,
}) {

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

  const cmd = absBinPath + ' ' + binArgStr

  await runExec(absBinPath, {cwd, repoRoot, projectRoot: project.root, config})

  //////////////////////////////////////////////////////////////////////////////

  function printHelp() {
    // TODO(vjpr): This should be `live app/package-bins` or something like that - not here.
    console.log(sectionHeaderPackageBinsFromPackage(project))
    printBins([project])

    console.log(sectionHeaderRepoBinsFromApp(project))
    printBins(projects.filter(p => p.bins))

    return exit(1)
  }

}
