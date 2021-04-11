import fs from 'fs'
import loadJsonFile from 'load-json-file'
import writeJsonFile from 'write-json-file'
import path, {join} from 'path'
import pathIsInside from 'path-is-inside'
import _ from 'lodash'
import findCacheDir from 'find-cache-dir'
import Debug, {perf} from '@live/log/es5'
import c from 'chalk'
import env from 'env-var'
import {hasPackageJsonChangedViaWatchman} from './watchman'
import yaml from 'yaml'

const debug = Debug('find-projects')

// Take from live.config.js
const ignoreDirs = [
  '**/node_modules/**',
  '**/bower_components/**',
  '.git/**',
  '.dev/**',
  '.idea/**',
  '.vjpr/**',
  '.git-subrepo/**',
]

// Process-level cache.
let cachedProjects = null

// Searches workspace to find all projects.
export default async function ({config, cwd}) {
  function log(...args) {
    if (config.cliFlags.verbose) console.log(...args)
  }

  const repoRoot = findRepoRoot(cwd)

  // NOTE: This cache doesn't use a key, so config/cwd args are assumed not to have changed.
  if (cachedProjects) {
    cacheLog('memory', log)
    return cachedProjects
  }

  const perfEnd = perf('read all pjsons')

  // Always read cache to get updated at time.
  // Shouldn't be too much of perf impact I hope.
  const {cache, cacheFile} = readCache({repoRoot})

  const useWatchman = true

  const shouldUseCache = await shouldUseCacheFn({
    config,
    cache,
    repoRoot,
    env,
    useWatchman,
  })

  if (shouldUseCache) console.log('Using package cache!')

  const {pjsons, cachedUsed} = await cachedGlob({
    repoRoot,
    config,
    cache,
    cacheFile,
    // TODO(vjpr): Change to `enableCache`.
    // When doing shell completion always use disk cache.
    disableCache: !shouldUseCache,
  })
  let projects = pjsons.map(({path: pkgRoot, manifest}) => {
    //const pjson = loadJsonFile.sync(pjsonPath)
    const pjson = manifest

    // Convert abs (from `find-packages`) to project-root-relative.
    // NOTE: We add `package.json` because `find-packages` returns the package root.
    // TODO(vjpr): Change this to the proper name. I think it was because we used a different way to locate the packages which returned the package.json file.
    // Must support
    //  - /root (no trailing slash)
    //  - /root/bar
    const pjsonPath = join(path.relative(repoRoot, pkgRoot), 'package.json')

    // NOTE: `config.appFolders` should take into account whether we using `public-symlink`.
    const {name: appDir, containingDir: appContainingDir} =
      getContainingDirs(config.appFolders, pjsonPath) || {}
    const {name: appTemplateDir, containingDir: appTemplateContainingDir} =
      getContainingDirs(config.appTemplateFolders, pjsonPath) || {}
    const {containingDir: repoContainingDir} =
      getContainingDirs(config.repoFolders, pjsonPath) || {}

    const bins = pjson.bin

    const pjsonLiveConfig = pjson.live

    const isRepoRoot = pjsonLiveConfig?.repoRoot

    if (isRepoRoot) return // Ignore

    // This check is done later.
    //const isApp = Boolean(appDir) && pjsonLiveConfig?.live?.app
    const isApp = Boolean(appDir)

    const parentDirName = _.last(path.dirname(pjsonPath).split('/'))

    return {
      name: pjson.name,
      dirName: appDir || appTemplateDir || parentDirName,
      //dirName: appDir || appTemplateDir,
      pkgPath: pjsonPath,
      //pjson, // May be too verbose.
      pjsonLiveConfig,
      root: path.dirname(pjsonPath),
      absRoot: path.dirname(path.join(repoRoot, pjsonPath)),
      isApp,
      // NOTE: If we use `pnpm-lock.yaml` to locate our packages, if `pnpm-workspace.yaml` ignores the templates, we won't find them.
      isAppTemplate: Boolean(appTemplateDir),
      bins,
      //appContainingDir,
      //appTemplateContainingDir,
      containingDir: appContainingDir || appTemplateContainingDir,
      repoContainingDir,
      repoContainingDirName: repoContainingDir && path.basename(repoContainingDir),
      // TODO(vjpr): Including the whole pjson might slow things down.
      //   I needed it for description.
      //manifest: pjson,
      // --
      repository: pjson.repository,
      description: pjson.description,
    }
  })
  const duration = perfEnd('read all pjsons')
  // Are we running shell completion?
  if (!config.completion) log('Find projects took ' + ms(duration))
  if (cachedUsed) cacheLog('disk', log)

  projects = projects.filter(Boolean)

  cachedProjects = projects
  return projects
}

////////////////////////////////////////////////////////////////////////////////

function ms(duration) {
  return Number(duration).toFixed(2) + 'ms'
}

async function cachedGlob({config, repoRoot, cacheFile, cache, disableCache}) {
  if (!disableCache) {
    if (cache) {
      const pjsons = cache.data
      return {pjsons, cachedUsed: true}
    }
  }

  // Stage: No cache found, reading file system.

  // There are 3 approaches. We only use one. The others should probably be commented out.

  const usePnpmWorkspace = false
  const useLiveConfig = true
  let pjsons

  const workspaceRoot = repoRoot

  function debugFn(out) {
    debug('Find packages perf stats:', out)
  }

  if (useLiveConfig) {
    const patterns = config.packages
    // PERF: ~200ms
    //const {default: findPackages} = await import('find-packages')
    const {default: findPackages} = await import('./find-packages-clone')
    // PERF: ~600ms
    // jsperf
    pjsons = await findPackages(workspaceRoot, {
      ignore: ignoreDirs,
      patterns,
      debug: debugFn, // Added in my fork.
    })
  } else if (usePnpmWorkspace) {
    // This will miss anything excluded by `pnpm-workspace.yaml` (say if we wanted to reduce number of packages installed - like templates).
    //   So we don't use it.
    //
    //// ---------------------
    //// NOTE: From pnpm `findWorkspacePackages`
    //
    //const packagesManifestPath = join(cwd, 'pnpm-workspace.yaml')
    //const packagesManifest = yaml.parse(
    //  fs.readFileSync(packagesManifestPath, 'utf8'),
    //)
    //// TODO(vjpr): We shouldn't use `pnpm-workspace.yaml` because users will
    ////   ignore things that we want to see.
    ////   We should specifically ignore duplicate dirs which are symlinked elsewhere.
    //const patterns = packagesManifest?.packages ?? undefined
    //
    //pjsons = await findPackages(workspaceRoot, {
    //  ignore: ['**/node_modules/**', '**/bower_components/**'],
    //  patterns,
    //})
  } else {
    // ---------------------

    // Old
    const glob = await import('glob')
    pjsons = await glob(['**/package.json'], {ignore: ['**/node_modules/**']})
    pjsons = pjsons.map(path => ({path, manifest: loadJsonFile.sync(path)}))
  }

  writeCache(pjsons, {cacheFile})
  return {pjsons}
}

/*

There are dirs which contain apps. The name of the app is taken from the dir directly inside the specified `appFolder` config.

The `package.json` file path can be deeper in the dir though.

p = packages/public-symlink/apps-templates/cra/package.json
dirs = [packages/public-symlink/apps-templates]
Returns `cra`

p = packages/public-symlink/apps-templates/cra/app/package.json
dirs = [packages/public-symlink/apps-templates]
Returns `cra` (not `app`)

Its a workaround because I did `apps/web/packages/app/package.json` once.
Could probably get rid of it because its complicated.

20210124Sun: I made some changes so it takes all the dirs after the containing dir.

 */
function getContainingDirs(dirs, p) {
  // TODO(vjpr): Find folder name it was found under...
  //return _(dirs).some(dir => pathIsInside(p, dir))
  const out = _(dirs)
    .map(dir => {
      // TODO(vjpr): There may be a problem with multiple packages in these app dirs though.
      //  We might need to look for something in the pjson file to verify its a live app.
      if (pathIsInside(p, dir)) {

        // a. Remove dir, and get first dir.
        // .../app/packages/main.package.json => app
        //const name = p.replace(dir + '/', '').split(path.sep)[0]

        // b. Remove dir, and get all.
        // .../app/packages/main.package.json => app/packages/main
        const name = path.dirname(p.replace(dir + '/', ''))

        return {name, containingDir: dir}
      }
    })
    .filter(Boolean)
    .value()
  if (!out.length) return false
  return out[0]
}

const projectsFixtures = [
  {
    name: 'xxx',
    root: 'xxx',
  },
]

////////////////////////////////////////////////////////////////////////////////

function cacheLog(cacheType, log) {
  let str = ''
  if (cacheType === 'disk') {
    str += 'Find projects used disk cache. '
    str += c.grey(`This could prevent new projects being found.`)
  } else if (cacheType === 'memory') {
    str += 'Find projects used in-memory cache. '
    str += c.grey(
      `If you are running in interactive mode, new projects won't be found until restart.`,
    )
  }
  log(str)
}

////////////////////////////////////////////////////////////////////////////////

function getCacheFile({repoRoot}) {
  const cacheDir = findCacheDir({
    name: 'live-cli',
    cwd: repoRoot,
    create: true,
    thunk: true,
  })
  const cacheFile = cacheDir('find-projects-cache')
  return cacheFile
}

function readCache({repoRoot}) {
  const cacheFile = getCacheFile({repoRoot})
  if (!fs.existsSync(cacheFile)) {
    return {cacheFile}
  }
  const cache = loadJsonFile.sync(cacheFile)
  return {cache, cacheFile}
}

function writeCache(data, {cacheFile}) {
  writeJsonFile.sync(cacheFile, {data, updatedAt: +new Date()})
}

////////////////////////////////////////////////////////////////////////////////

async function shouldUseCacheFn({config, cache, repoRoot, env, useWatchman}) {
  // TODO(vjpr): Document `argv.c`.
  let enableDiskCache =
    (config.cliFlags.c || env.get('LIVE_CLI_USE_DISK_CACHE').asBool()) ?? false

  // TODO(vjpr): We shouldn't always be true if `global.completion` is set.
  const useDiskCache = global.completion ? true : enableDiskCache

  if (useWatchman) {
    // TODO(vjpr): Use `fb-watchman` to check if any `package.json` files have changed since last query.
    const since = cache?.updatedAt
    const hasPackageJsonChanged = await hasPackageJsonChangedViaWatchman({
      repoRoot,
      since,
    })
    return !hasPackageJsonChanged
  } else {
    return useDiskCache
  }
}

////////////////////////////////////////////////////////////////////////////////

function findRepoRoot(cwd) {
  const findUp = require('find-up')
  const path = require('path')
  const rootMarkerFile = findUp.sync('pnpm-workspace.yaml', {cwd})
  if (!rootMarkerFile) return process.cwd()
  return path.dirname(rootMarkerFile)
}
