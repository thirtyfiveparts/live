import debouncePromise from 'debounce-promise'
import {Watcher} from '@live/watchman-wrapper/src/defaults/source-code-files'
import c from 'chalk'
import {getWorkspacePackages, getRepoRoot} from '@live/get-workspace-pkgs'
import _ from 'lodash'
import barrelsby from 'barrelsby/bin/index'
import {buildBarrels} from 'barrelsby/bin/builder'
import {buildTree} from 'barrelsby/bin/fileTree'
import {getDestinations} from 'barrelsby/bin/destinations'
import fse from 'fs-extra'
import path, {join} from 'path'
import {purge} from 'barrelsby/bin/purge'

export default async function () {
  const root = getRepoRoot()

  const oneTimeIgnores = new Set()

  const watcher = new Watcher('barrelsby-watcher', ['.tsx', '.ts'], root)
  await watcher.init()
  let firstRun = true
  const debouncedRun = debouncePromise(run) // Runs on trailing edge of interval by default.
  watcher.onChange(async changedFiles => {
    let allFiles = await watcher.query()
    debouncedRun({allFiles, changedFiles, firstRun, root}).then()
    firstRun = false
  })

  async function run({allFiles, changedFiles, firstRun, root}) {
    if (firstRun) {
      return
    }

    // We ignore files that were just written by barrelsby to avoid infinite loops.
    if (oneTimeIgnores.size) {
      changedFiles = changedFiles.filter(f => {
        const absFile = join(root, f.name)
        const ignored = oneTimeIgnores.has(absFile)
        if (ignored) {
          oneTimeIgnores.delete(absFile)
          console.log('Ignoring change to', c.blue(f.name))
        }
        return !ignored
      })
    }

    if (!changedFiles.length) return

    let str = ''
    changedFiles.map(f => (str += `Changed: ${c.blue(f.name)}\n`))
    console.log(str)

    const pkgs = await getProjectsForModifiedSourceFiles({changedFiles, root})

    console.log(
      'Affected packages:',
      pkgs.map(p => p.manifest.name),
    )

    for (const pkg of pkgs) {
      await runBarrelsby(pkg)
    }
  }

  async function getProjectsForModifiedSourceFiles({changedFiles, root}) {
    const reload = changedFiles.map(f => f.name.includes('package.json')).some(Boolean)
    if (reload) {
      console.log(`Reloading all 'package.json' files from disk`)
    }
    const pkgs = await getWorkspacePackages({reload})

    let affectedPkgs = changedFiles.map(file => {
      const containingPkgs = _.filter(pkgs, p => {
        const repoRelPkgPath = p.dir.replace(root + '/', '')
        return file.name.startsWith(repoRelPkgPath)
      })
      // TODO(vjpr): Instead of looking for longest just sort the packages up front.
      return longest(containingPkgs, 'dir')
    })

    affectedPkgs = _.uniqBy(affectedPkgs, 'manifest.name')

    return affectedPkgs
  }

  async function runBarrelsby(pkg) {
    const pkgDir = pkg.dir
    const barrelConfigs = pkg.manifest.live?.barrel?.configs ?? []

    console.log('Processing package root:', pkgDir)

    barrelConfigs.map(conf => {
      const dir = path.resolve(join(pkgDir, conf.dir))
      const barrelName = conf.name ?? 'index.ts'
      console.log(`Processing '${barrelName}' sub-dir '${dir}'`)
      let {include, exclude, structure, local, location, exportDefault} = conf
      structure = structure ?? 'flat'
      local = local ?? false
      location = location ?? undefined // 'top'
      exportDefault = exportDefault ?? undefined
      runRunBarrelsby({dir, barrelName, include, exclude, structure, oneTimeIgnores})
    })
  }
}

////////////////////////////////////////////////////////////////////////////////

//barrelsby({
//  name: 'index',
//  noSemicolon: true,
//  singleQuotes: false,
//  directory: absDirs[0],
//})

function runRunBarrelsby({dir, barrelName, include, exclude, structure, local, exportDefault, location, oneTimeIgnores}) {
  const logger = (...args) => {
    //console.log(...args)
  }

  // See: https://github.com/bencoveney/barrelsby#-l-mode-or---location-mode
  const args = {
    // top, below, all, etc.
    location,
    exportDefault,
    // flat, filesystem
    structure,
    local,
    include,
    exclude,
    delete: true,
  }

  const treeLogger = args => {
    //console.log(args)
  }
  const rootPath = dir
  const rootTree = buildTree(rootPath, barrelName, treeLogger)

  const destinations = getDestinations(
    rootTree,
    args.location,
    barrelName,
    logger,
  )


  const barrelFiles = findBarrels(destinations)

  function findBarrels(dirs) {
    let barrelFiles = []
    for (const dir of dirs) {
      if (dir.barrel) {
        barrelFiles.push(dir.barrel.path)
      }
      if (dir.directories?.length) {
        findBarrels(dir.directories)
      }
    }
    return barrelFiles
  }

  console.log(barrelFiles)

  barrelFiles.map(f => oneTimeIgnores.add(f))

  // TODO(vjpr): We don't purge because we only want to regenerate if we have to.
  //   Check if this breaks things.
  //purge(rootTree, args.delete !== undefined && args.delete, barrelName, logger)

  buildBarrels(
    destinations,
    "'", // quoteCharacter
    '', // semicolonCharacter
    barrelName, //barrelName,
    logger, // logger
    undefined, // baseUrl,
    !!args.exportDefault,
    args.structure,
    !!args.local,
    ([] as string[]).concat(args.include || []),
    ([] as string[]).concat(args.exclude || []),
  )
}

////////////////////////////////////////////////////////////////////////////////

function longest(arr, prop) {
  if (!arr.length) return null
  return arr.reduce((a, b) => (a[prop].length > b[prop].length ? a : b))
}
