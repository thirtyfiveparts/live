import Yargs from 'yargs'
import c from 'chalk'
import path, {join} from 'path'
import simpleGit from 'simple-git/promise'
import isGitClean from 'is-git-clean'
import fse from 'fs-extra'
import symlinkDir from 'symlink-dir'
import sync from './sync'
import compare from './compare'
import tildify from 'tildify'
import Debug from 'debug'
import excludes from './excludes'
const debug = Debug('index')

function diffPhase() {}

function printHelpTitle(pkg) {
  console.log(pkg.name + ' - ' + pkg.description)
}

export default async function () {
  const repoRoot = process.cwd()
  console.log('Using repo root:', repoRoot)

  // WARN: Source file relative paths!
  const pathToReadme = tildify(join(__dirname, '../readme.md'))
  const pkg = require('../package.json')
  // --

  printHelpTitle(pkg)

  const yargs = Yargs.boolean('dryRun')
    .boolean('interactive')
    .boolean('skipGitCleanCheck')
    .alias({dryRun: 'd', interactive: 'i', skipGitCleanCheck: 'g'})
    // Disable `help as implicit command`. See https://github.com/yargs/yargs/blob/master/docs/api.md#helpoption-description.
    .help(false).argv

  let cmd = yargs._[0]

  if (!cmd) cmd = 'help'

  console.log('Running', cmd)

  if (cmd === 'help') {
    console.log()
    console.log(`See '${pathToReadme}' for details.`)
    process.exit()
  }

  if (cmd !== 'sync') {
    return
  }

  let srcDir = yargs._[1]
  let monorepoTemplateDir = join(__dirname, '../templates/template-monorepo-files')
  let destDir = yargs._[2]
  let dryRun = yargs.dryRun
  let isShowDiff = yargs.showDiff
  let interactive = yargs.interactive
  let skipGitCleanCheck = yargs.skipGitCleanCheck

  if (dryRun) {
    console.log('Running in DRY RUN mode!')
  }

  const step = makeStepFn(srcDir, destDir)

  console.log({srcDir, destDir})

  if (!destDir) {
    console.log('Please specify dest dir')
    // NOTE(vjpr): If you added a flag and didn't set to boolean it could be stealing the positional arg.
    return
  }

  //////////////////////////////////////////////////////////////////////////////

  await step('Ensure dest dir exists', async function () {
    await fse.ensureDir(destDir)
  })

  //////////////////////////////////////////////////////////////////////////////

  await step('Ensure dest dir is a git repo', async function () {
    const isRepo = await simpleGit(destDir).checkIsRepo()
    if (!isRepo) {
      console.log('Initializing git repo')
      await simpleGit(destDir).init()
    }
  })

  //////////////////////////////////////////////////////////////////////////////

  logStage('Monorepo root dir')

  //////////////////////////////////////////////////////////////////////////////

  await step('Check working dir is clean', async () => {
    const proceed = await checkGitWorkingDirClean({
      // TODO(vjpr): Do we really need the `srcDir` to be clean?
      srcDir,
      destDir,
      skipGitCleanCheck,
    })
    if (!proceed) throw new Error()
  })

  //////////////////////////////////////////////////////////////////////////////

  const dirs = `(${tildify(monorepoTemplateDir)} -> ${tildify(destDir)})`
  await step(`Sync monorepo template dir with dest\n${dirs}`, async () => {
    const diffSet = await compare(monorepoTemplateDir, destDir, {
      ignore: excludes,
    })
    await sync({diffSet, srcDir: monorepoTemplateDir, destDir, dryRun, interactive, isShowDiff})
  })

  //////////////////////////////////////////////////////////////////////////////

  logStage('"repos" dir')

  //////////////////////////////////////////////////////////////////////////////

  await step('Ensure "repos" dir exists', async () => {
    await fse.ensureDir(join(destDir, 'repos'))
  })

  // DEBUG
  const skipSymlinks = true

  let msg = ''

  if (!skipSymlinks) {

    msg =
      'Symlink "repos/live" to "repos/live-subtree"'
    await step(msg, async () => {
      // NOTE: ensureSymlink doesn't overwrite existing symlinks.
      // NOTE: symlinkDir makes it relative.
      await fse.ensureDir(join(destDir, 'repos/thirtyfive-public-subtree'))
      await symlinkDir(
        join(destDir, 'repos/thirtyfive-public-subtree'),
        join(destDir, 'repos/thirtyfive-public'),
      )
      //await symlinkDir('public', join(destDir, 'packages/public-symlink'))
    })

    //////////////////////////////////////////////////////////////////////////////

    msg =
      'Symlink "repos/live-symlink" to "{srcDir}/repos/live"'
    await step(msg, async () => {
      await symlinkDir(
        join(srcDir, 'repos/thirtyfive-public'),
        join(destDir, 'packages/thirtyfive-public-symlink'),
      )
    })

    //////////////////////////////////////////////////////////////////////////////

    msg = 'Symlink "repos/org" to "{srcDir}/repos/org-subtree"'
    await step(msg, async () => {
      await fse.ensureDir(join(destDir, 'repos/org'))
      await fse.ensureDir(join(destDir, 'repos/org-subtree'))
      await symlinkDir(
        join(destDir, 'packages/org-subtree'),
        join(destDir, 'packages/org'),
      )
    })

  }

  // {srcDir}/repos/thirtyfive-public/template-org -> repos/org
  ////////////////////

  // Copy a CRA app so that we can run something immediately.
  // Name it live-demo or something or something.

  // packages/public-symlink/template-config -> packages/config
  ////////////////////

  logStage('"config" dir')

  msg = 'Sync "{srcDir}/config" to "{destDir}/config"'
  await step(msg, async () => {
    await fse.ensureDir(join(destDir, 'config'))
    const diffSetConfig = await compare(
      join(srcDir, 'config'),
      join(destDir, 'config'),
      {
        ignore: excludes,
      },
    )

    await sync({
      diffSet: diffSetConfig,
      srcDir,
      destDir,
      dryRun,
      interactive,
      isShowDiff,
    })
  }, true)

  ////////////////////
}

/*

Note about config...

Default tooling config is here `packages/public-symlink/tools`. There is a script that then checks if custom config files exist in `packages/config/tools` and will use it.

We try to keep to defaults as much as possible.

*/

////////////////////////////////////////////////////////////////////////////////

async function checkGitWorkingDirClean({srcDir, destDir, skipGitCleanCheck}) {
  // a. Detailed git status
  //const srcGitStatus = await simpleGit(srcDir).status()
  //const destGitStatus = await simpleGit(destDir).status()
  //console.log({srcGitStatus, destGitStatus})

  // b. Boolean git status
  const srcClean = await isGitClean(srcDir)
  const destClean = await isGitClean(destDir)
  //console.log({srcClean, destClean})

  if (!destClean) {
    // This allows you to be able to get a clean diff of what will change.
    console.log(
      'Destination dir working dir is not clean. Please commit, stash, or reset your current changes before syncing.',
    )
    console.log(c.grey(`$ git -C ${destDir} stash`))
    console.log()
    if (skipGitCleanCheck) return true
    return false
  }

  // TODO(vjpr): Check src as well. If you accidentally put your current repo it can cause huge havoc!

  // Dest in clean. We should proceed.
  return true
}

function makeStepFn(srcDir, destDir) {
  return async function step(msg, fn, disabled = false) {
    if (disabled) return console.log('Step disabled.')
    //(${tildify(srcDir)} -> ${tildify(destDir)})
    msg = `-> ${msg}`
    console.log(msg)
    console.log()
    return await fn()
  }
}

function logStage(msg) {
  console.log()
  console.log(c.bold.underline(msg))
  console.log()
}
