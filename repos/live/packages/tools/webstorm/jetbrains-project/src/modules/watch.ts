import chokidar from 'chokidar'
import Debug from 'debug'
import findDown from '@src/modules/find-down'
import _ from 'lodash'
import path, {join, relative} from 'path'
import fs from 'fs'
import updateExcludes from '@src/modules/update-excludes'
import escapeStringRegexp from 'escape-string-regexp'
import existsSync from '@src/modules/exists-sync-mr'
import pathDescendsFrom from '@src/modules/path-descends-from'
import getSymlinks from 'get-symlinks'
import fastGlob from 'fast-glob'
import os from 'os'
import updateRunConfigurations from '@src/modules/update-run-configurations'

const debug = Debug('jetbrains-project')

export default async function watch({cwd, dryRun, imlFile, ideaPath}) {
  const defaultExcludeDirs = getDefaultExcludeDirs()
  const defaultIgnoreGlobs = ['.git', 'examples', '__tests__']

  // Config
  // --------------------

  const config = readConfig({cwd: process.cwd()})

  function readConfig({cwd}) {
    const configPath = path.join(cwd, 'jbp.config.js')
    if (!fs.existsSync(configPath)) return {}
    // Always force new require of config in case it was changed.
    delete require.cache[require.resolve(configPath)]
    const configFn = require(configPath)
    // --
    const config = configFn({defaultExcludeDirs, defaultIgnoreGlobs})
    debug(config)
    return config || {}
  }

  // Patterns will be applied recursively. Paths and globs are static and only exclude files when watching starts.

  const excludePaths = config.excludePaths || []
  const excludeDirs = config.excludeDirs || defaultExcludeDirs
  const excludeGlobs = config.excludeGlobs || []
  const ignoreGlobs = config.ignoreGlobs || defaultIgnoreGlobs
  // TODO(vjpr): This can be slow for large dirs.
  const excludeGlobsPaths = fastGlob.sync(excludeGlobs, {
    cwd,
    onlyDirectories: true,
    ignore: ['**/node_modules/**'],
  })
  const excludeByGlob = config.excludeByGlob || []
  const relPathGlobs = config.relPathGlobs || []
  console.log({excludeGlobsPaths, excludeGlobs, excludeByGlob})

  // ---

  const symlinks = findAllSymlinks({cwd})
  const symlinksToSearch = symlinks.map(link => link.path)
  console.log({symlinksToSearch})

  // TODO(vjpr): Support multiple roots.

  // Update function
  // --------------------

  // NOTE: Debounces to next tick. This should work unless we do async stuff.
  const update = _.debounce(updateFn, 0)

  // Watch
  // --------------------

  const watcherOpts = {
    cwd,
    followSymlinks: false,
    ignoreInitial: true,
    persistent: true,
    useFsEvents: true,

    disableGlobbing: true,
    depth: 0,

    //disableGlobbing: false,
    //depth: 0,
  }

  const globs = ['.', ...symlinksToSearch]

  const watcher = chokidar.watch(globs, watcherOpts)

  watcher
    .on('all', changeHandler)
    .on('ready', () => {
      console.log('Watching...')
    })
    .on(
      'raw',
      rawHandler({cwd, searches: excludeDirs, update, symlinks, watcher}),
    )
    .on('error', e => {
      console.error(e)
    })

  async function updateFn() {
    let {excludes: newExcludes} = getExcludes({
      cwd,
      filenameGlobs: excludeDirs,
      relPathGlobs,
      ignoreGlobs,
    })
    newExcludes.push(...excludePaths, ...excludeGlobsPaths)
    updateExcludes({cwd, imlFile, newExcludes, dryRun})
    updateRunConfigurations({cwd, ideaPath, dryRun})
  }

  console.log('Running initial update...')
  await update()
}

////////////////////////////////////////////////////////////////////////////////

function changeHandler({cwd, searches, update}) {
  return function (event, p, details) {
    debug('add/change/unlink', {event}, p)
  }
}

function findAllSymlinks({cwd}) {
  // Chokidar returns real paths instead of reolved paths for symlinks
  // TODO(vjpr): https://github.com/paulmillr/chokidar/issues/691
  // We manually search for symlinks in this case and map them up.
  const symlinkSearchPath = '**'
  let links = fastGlob.sync('**/*', {
    onlyDirectories: true,
    ignore: ['**/node_modules/**'],
    stats: true,
  })
  links = links
    .filter(f => f.isSymbolicLink())
    .map(f => {
      return {path: f.path, realpath: fs.realpathSync(f.path)}
    })
  return links
}

// TODO(vjpr): This is hacky. Let's just patch Chokidar.
function findSymlinkResolvedPath(p, symlinks) {
  // NOTE: Without the following line, we cannot handle newly added symlinks.
  //const links = findAllSymlinks({cwd})

  const matchingLinks = _(symlinks)
    .filter(link => p.startsWith(link.realpath))
    .value()
  if (matchingLinks.length) {
    const link = matchingLinks[0] // TODO(vjpr): Could be multiple!
    const resolvedSymlinkPath = p.replace(link.realpath, link.path)
    console.log({resolvedSymlinkPath})
    // TODO(vjpr): Check this!
    p = resolvedSymlinkPath
    return p
  }
  return p
  // ---
}

function rawHandler({cwd, searches, update, symlinks, watcher}) {
  // TODO(vjpr): `eventType` should be renamed to `eventName` because of `details.type`.
  return async function (eventType, p, details) {
    // PERF: This is called for every single event. Make sure it is efficient.
    debug('raw file event', eventType, p, details)

    if (details.type === 'symlink' && eventType === 'deleted') {
      console.log('symlink deleted', p)
      // TODO(vjpr): Only unwatch if its being watched.
      // TODO(vjpr): Use realpath?
      console.log('unwatching symlink', p)
      watcher.unwatch(p)
      await update()
    }

    if (details.type === 'symlink' && eventType === 'unknown') {
      //
      // `node_modules` events are triggered here. Maybe its because this symlink-watching feature used to be broken.
      // symlink created /x/packages/public/apps-templates/mobile-crna/node_modules/.registry.npmjs.org/repeating/2.0.1/node_modules/is-finite
      //
      if (!/node_modules/.test(p)) {
        console.log('symlink created', p)
        console.log('watching symlink', p)
        watcher.add(p)
        await update()
      }
    }

    // TODO(vjpr): Disabled because we don't actually need to get the proper filename because the exclude function searches all over again.
    //   It would only be an optimization.
    //p = findSymlinkResolvedPath(p, symlinks)

    // If a dir is moved/renameed, we will not get an event that its children have moved, and we may need to exclude its children.
    // This event will fire with the previous path of the moved dir.
    if (eventType === 'moved') {
      const [e, exists] = existsSync(p)
      if (e) throw e
      if (!exists) {
        console.log('Directory moved from (new dest is in another event):', p)
        return
      }
      if (isDirectory(p)) {
        const relPath = relative(cwd, p)

        if (/node_modules/.test(p)) {
          console.warn(
            `NOTE: Directory is in 'node_modules' so will be ignored.`,
          )
          return
        }

        console.log('Directory moved to:', relPath)

        /**
         // TODO(vjpr): If the dir is moved to somewhere that is already filtered.
         //   We could probably safely ignore it.
         //   This would mean that there might be non-existing excludes, but they will be cleaned up next update.
         // We only care if we move dir and its now not excluded.
         // The debouncing may be enough.
         */

        // a. Just run update (its debounced).
        await update()
        // b. Check for excludes in this tree.
        // TODO(vjpr): Do we need to optimize here?
      }
      return
    }
    await updateIfNeeded({eventType, p, details}, {cwd, searches, update})
  }
}

async function updateIfNeeded({eventType, p, details}, {cwd, searches, update}) {
  const endsWithExcludedDir = _(searches).some(search => p.endsWith(search))
  if (!endsWithExcludedDir) return

  // Is a higher up part of its path already excluded?
  const pathDescendsFromAnExcludedDir = _(searches).some(dir => {
    return pathDescendsFrom(p, dir)
  })
  if (pathDescendsFromAnExcludedDir) return

  // We have the shallowest `node_modules` match in the path.
  // This is what we are looking for.
  const relPath = relative(cwd, p)

  // Sometimes after deleting, then re-creating the dir with same name, event
  // is `deleted`, when it should be `created`. Wierd.
  // Chokidar's event stats don't help either.
  // Might vary across platforms.

  // Check directory status.
  const [e, exists] = existsSync(p)
  if (e) throw e
  if (!exists) {
    // Deleted.
    console.log('Directory deleted', relPath)
    await update()
  } else {
    // Created.
    console.log('Directory created', relPath)
    await update()
  }
}

//import getExcludes from '@src/modules/get-excludes/index'
function getExcludes({cwd, filenameGlobs, relPathGlobs, ignoreGlobs}) {
  ignoreGlobs = ignoreGlobs || []
  const {excludes, notExcluded} = findDown({
    cwd,
    // Good for:
    // - dirs that are automatically excluded by IDE.
    // - dirs of packages that are not usually installed such as `examples`.
    ignoreGlobs,
    filenameGlobs,
    // TODO(vjpr): Match partial paths.
    //pathGlobs: ['nuclide/pkg'],
    relPathGlobs,
  })
  return {excludes, notExcluded}
}

import {statSync} from 'fs'

// stats - allow cached stats.
function isDirectory(p, stats) {
  stats = stats || statSync(p)
  return stats.isDirectory()
}

function getDefaultExcludeDirs() {
  // TODO(vjpr): These should be added as `excludePatterns`...and also ignore searching underneath them.
  return [
    'node_modules',
    'lib',
    'build',
    '.next',
    'flow-typed',
    'tmp',
    'dist',
    '.dev',
    // For git subrepo
    '.git-subrepo',
    // For react-native.
    // TODO(vjpr): Make these path specific. Set excludes that have to match a glob themselves
    //   We only want to exclude these for `node_modules/**`.
    //   Called `excludeByGlobs`. E.g. `node_modules/react-native/**`: ['ios', 'android'].
    'ios',
    'android',
    // For gatsby.
    '.cache',
    // For pnpm tests.
    '.tmp',
  ]
}
