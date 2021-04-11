import glob from 'globby'
import readPkg from 'read-pkg'
import {
  getPkgNameRoot,
  getAllDepsByPath,
  getAllDeps,
  getPkgGraph,
  getDestForPkgName,
} from '@src/modules/shared'
import cpy from 'cpy'
import path, {join} from 'path'
import util from 'util'
import c from 'chalk'
import isUndefined from 'is-undefined'

//import Dockerfile from 'dockerfilejs'
//import _ from 'lodash'
//import npmPackageArg from 'npm-package-arg'
//import findPackages from 'find-packages'
//import shrinkwrapFile from '@pnpm/shrinkwrap-file'
//import filterShrinkwrap from '@pnpm/filter-shrinkwrap'
//import getImageNameFromPkg from '@src/modules/image-name-from-pkg'

const tmpPjsonTreeDir = 'tmp-pjson-tree'

// shouldPrint - should print file lists
export default async function main(pkgName, opts) {
  if (!pkgName) throw new Error('You must specify a pkgName')

  let {dryRun, shouldPrint, onlyPjsons} = opts
  shouldPrint = isUndefined(shouldPrint) ? true : shouldPrint
  dryRun = isUndefined(dryRun) ? false : dryRun

  if (dryRun)
    console.warn('Running in dry-run mode. No copy operations will take place.')

  const repoRoot = process.cwd()
  const pkgNameRoot = getPkgNameRoot(pkgName)
  const dest = getDestForPkgName(repoRoot, pkgName)

  // TODO(vjpr): What happens if one package contains another?
  //   Like the root package.
  //   I think we should treat root package as special.
  //   For other packages anything beneath the pjson could be potentially accessed.
  //   Or! we could assume that packages in packages must be in a `packages` dirs - then we use same logic everywhere.
  //     The regex might be difficult.
  const ignoreGlobs = getIgnores().map(d => `**/${d}/**`)
  const globOpts = {dot: true}

  const pkgGraph = await getPkgGraph(repoRoot)

  const depPaths = await getAllDeps(pkgName, pkgGraph)
  const relDepPaths = absToRepoRootRelPaths(depPaths, repoRoot)

  //////////////////////////////////////////////////////////////////////////////

  await copyPjsons()

  if (onlyPjsons) return

  async function copyPjsons() {
    let globs = [
      '**/package.json',
      'pnpm-lock.yaml', // Assume `shared-workspace-shrinkwrap`.
      '**/pnpmfile.js',
      // All pnpmfile stuff must be in a dir named pnpmfile.
      // TODO(vjpr): This is hacky!
      // TODO(vjpr): Maybe we should say that all files involved in pnpmfile need to be named `foo.pnpmfile.js`...
      '**/pnpmfile/**',
      '**/pnpm/**',
      '.npmrc',
      'pnpm-workspace.yaml',
      // https://github.com/pnpm/pnpm/issues/1653
      // We need to exclude `.venv/bin`.
      '**/bin/**',
      '**/cli.js',
      // TODO(vjpr): Ignore non-symlinked packages.
    ]

    // Copy everything needed to run `pnpm i` to a separate dir.
    const type = 'package.json and shrinkwrap files'
    const ignore = ignoreGlobs
    const files = await glob(globs, {cwd: repoRoot, ignore, ...globOpts})
    const pjsonDest = getTmpPjsonTreeDir(dest, tmpPjsonTreeDir)
    let desc = `Copying ${files.length} ${c.cyan(type)} from `
    desc += `${relativize(repoRoot)} to ${relativize(pjsonDest)}`
    printFileList(files, {shouldPrint})
    await copyWithProgress(
      globs,
      pjsonDest,
      {
        parents: true,
        ignore,
        ...globOpts,
      },
      {desc, dryRun},
    )
  }

  ////////////////////////////////////////////////////////////////////////////////

  // Copy packages
  ////////////////////

  {
    const source = [...relDepPaths]
    const ignore = ignoreGlobs
    const files = await glob(source, {cwd: repoRoot, ignore, ...globOpts})
    const type = `files inside workspace dependencies of ${c.bold(
      pkgName,
    )} from`
    const desc = getCopyDescription({files, type, repoRoot, dest})
    printFileList(files, {shouldPrint})

    await copyWithProgress(
      source,
      dest,
      {
        parents: true,
        ignore,
        ...globOpts,
      },
      {desc, dryRun},
    )
  }

  // Copy root (except 'packages' dir)
  ////////////////////

  {
    // `packages/**` is there for legacy reasons.
    const packagesDirs = ['packages/**', 'repos/**']

    const globs = ['.']

    const ignore = [...packagesDirs, ...ignoreGlobs]
    const files = await glob(globs, {cwd: repoRoot, ignore, ...globOpts})
    const type = 'from repo root'
    const desc = getCopyDescription({files, type, repoRoot, dest})
    printFileList(files, {shouldPrint})

    await copyWithProgress(
      globs,
      dest,
      {
        parents: true,
        ignore,
        ...globOpts,
      },
      {desc, dryRun},
    )
  }

  // Copy root pkg deps
  ////////////////////
  // TODO(vjpr): We could merge this with the app deps task because some will be the same.
  // PERF

  {
    const rootPkgName = await getRootPkgName(repoRoot)
    //const pkgAtPath = '.' // See https://github.com/pnpm/pnpm/issues/1637#issuecomment-460946814
    let depPaths = await getAllDeps(rootPkgName, pkgGraph)
    depPaths = depPaths.filter(p => p !== repoRoot)
    const relDepPaths = absToRepoRootRelPaths(depPaths, repoRoot)

    const globs = relDepPaths

    const ignore = ignoreGlobs
    const files = await glob(globs, {cwd: repoRoot, ignore, ...globOpts})
    const type = 'from repo root workspace dependencies'
    const desc = getCopyDescription({files, type, repoRoot, dest})
    printFileList(files, {shouldPrint})

    await copyWithProgress(
      globs,
      dest,
      {
        parents: true,
        ignore,
        ...globOpts,
      },
      {desc, dryRun},
    )
  }

  // Copy non-explicit files and deps.
  ////////////////////

  // TODO(vjpr): We should try make these real deps if possible.
  // TODO(vjpr): We should read from live.config.js.

  // 1. We must copy all the files.
  // 2. We must copy deps of any packages in these files.

  // 20201014Wed: Commented-out.
  //const customPaths = [
  //  './packages/public-symlink/tools',
  //  './packages/config',
  //  // We have some package path references in the xxx project still...
  //  // TODO(vjpr): We should get rid of them.
  //  './packages/xxx-symlink/pages',
  //  './packages/xxx-symlink/components',
  //  './packages/xxx-symlink/xxx',
  //]

  const liveConfigFile = join(process.cwd(), 'live.config.js')
  const liveConfig = require(liveConfigFile)
  const customPaths = liveConfig.dockerMonorepo?.customPaths

  // 1. manually specified files
  ////////////////////

  if (customPaths?.length) {
    const ignore = ignoreGlobs
    const globs = customPaths.map(p => p + '/**')
    //['packages/public-symlink/tools/**', 'packages/config/**']

    const files = await glob(globs, {cwd: repoRoot, ignore, ...globOpts})
    // TODO(vjpr): Also need to copy their dependencies if any of them are packages.

    const type = 'manually specified files'
    const desc = getCopyDescription({files, type, repoRoot, dest})
    printFileList(files, {shouldPrint})
    await copyWithProgress(
      globs,
      dest,
      {
        parents: true,
        ignore,
        ...globOpts,
      },
      {desc, dryRun},
    )
  }

  // 2. manually specified file deps
  ////////////////////

  if (customPaths?.length) {
    const ignore = ignoreGlobs

    const paths = await Promise.all(
      customPaths.map(async p => {
        return await getAllDepsByPath(p, pkgGraph)
      }),
    )
    const allDeps = [].concat(...paths)

    const pkgNames = await pkgPathsToPkgNames(allDeps)
    const depPaths = await getAllDeps(pkgNames, pkgGraph)
    const relDepPaths = absToRepoRootRelPaths(depPaths, repoRoot)

    const globs = relDepPaths

    const type = 'manually specified file deps'
    const files = await glob(globs, {cwd: repoRoot, ignore, ...globOpts})
    const desc = getCopyDescription({files, type, repoRoot, dest})
    printFileList(files, {shouldPrint})
    await copyWithProgress(
      globs,
      dest,
      {
        parents: true,
        ignore,
        ...globOpts,
      },
      {desc, dryRun},
    )
  }
}

////////////////////////////////////////////////////////////////////////////////

function getIgnores() {
  return [
    //'lib', // We transpile some stuff so this needs to be included!
    //'dist', // Also needed by `i-protobufjs`.
    'build',
    'tmp',
    // Where we put just the stuff needed to `pnpm i`.
    // Must also be ignored in the pnpm-workspace.yaml
    tmpPjsonTreeDir,
    // --
    '.cache',
    'flow-typed',
    '.dev',
    '.git-subrepo',
    '.next',
    'node_modules',

    //'archive', // These are still inside the shrinkwrap so need to leave them for now.
    '.docker-trees', // Very important, otherwise we re-copy each time!

    'cypress/video',
    '.circleci',
    '.git',
    '.idea',
    '.vjpr', // TODO(vjpr): Move to live.config.js.
    '.vagrant',

    '.venv',

    '.run',
  ]
}

////////////////////////////////////////////////////////////////////////////////

async function pkgPathsToPkgNames(pkgPaths) {
  let out = []
  for (const pkgPath of pkgPaths) {
    out.push((await readPkg({cwd: pkgPath})).name)
  }
  return out
}

function getCopyDescription({files, type, repoRoot, dest}) {
  return `Copying ${files.length} ${c.cyan(type)} ${relativize(
    repoRoot,
  )} to ${relativize(dest)}`
}

function printFileList(files, {shouldPrint}) {
  if (!shouldPrint) return
  util.inspect.defaultOptions.maxArrayLength = null
  // Because of console.log truncation.
  console.log(util.inspect(files, true, 10, true))
}

async function getRootPkgName(repoRoot) {
  // TODO(vjpr): Do this safer.
  return (await readPkg({cwd: repoRoot})).name
}

function absToRepoRootRelPaths(depPaths, repoRoot) {
  return depPaths.map(p => p.replace(repoRoot, '.'))
}

function getTmpPjsonTreeDir(dest, tmpPjsonTreeDir) {
  return join(dest, tmpPjsonTreeDir)
}

function relativize(p) {
  return './' + path.relative(process.cwd(), p)
}

import progress from 'cli-progress'
import ora from 'ora'

async function copyWithProgress(globs, dest, opts, {desc, dryRun}) {
  if (dryRun) {
    console.log(desc)
    return console.log('Skipping copy because of --dry-run')
  }
  //const spinner = ora('Copying files...')
  const stream = process.stdout
  //stream.isTTY = true // Force tty because we execute our command by piping.
  const spinner = ora(desc, {isEnabled: true, stream})
  spinner.start()
  await cpy(globs, dest, opts).on(
    'progress',
    ({completedFiles, totalFiles, completedSize}) => {
      //spinner.text = `${completedFiles} / ${totalFiles}`
    },
  )
  spinner.succeed()
}
