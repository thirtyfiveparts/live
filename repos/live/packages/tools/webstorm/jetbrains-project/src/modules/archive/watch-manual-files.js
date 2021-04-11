// Watches files

import chokidar from 'chokidar'
import Debug from 'debug'
import findDown from '@src/modules/find-down'
import updateExcludes from '@src/modules/update'
import prettyjson from 'prettyjson'
import anymatch from 'anymatch'
import _ from 'lodash'
import minimatch from 'minimatch'

const debug = Debug('node-idea')

export default function watch({cwd, dryRun, imlFile}) {
  const ignored = new ChokidarIgnored()
  const watcherOpts = {
    cwd,
    followSymlinks: false,
    ignoreInitial: true,
    // TODO(vjpr): This is strange. `@*/* should match` but we need depth=1.
    // Slows things down from watching too many files.
    //depth: 1,
    depth: 0,
    persistent: true,
    useFsEvents: true,
    disableGlobbing: true,
    //ignored: ignored.getChokidarIgnoredCallback(),
  }
  let {excludes: newExcludes, notExcluded} = getExcludes({cwd})
  const globs = notExcluded
  const watcher = chokidar.watch(globs, watcherOpts).on('all', changeHandler)
  watcher.on('ready', () => {
    printWatchedPaths({watcher, globs, cwd})
    ignored.printVisits()
  })
  watcher.on('raw', (event, p, details) => {
    const {
      path,
      event: rawEvent,
      type,
      changes: {inode, finder, access, xattrs},
      flags,
    } = details
    debug('raw file event', type, p, details)
  })
  watcher.on('error', e => {
    console.error(e)
  })
  // Run on startup.
  updateExcludes({cwd, imlFile, newExcludes, dryRun})

  ////////////////////

  function changeHandler(event, p) {
    debug('add/change/unlink event', event, p)
    if (event === 'addDir') {
      console.log('Added dir', p)
      // Watch it unless we ignore it.
      if (shouldWatchInside(p)) {
        console.log('Watching', p)
        watcher.add(p)
      }
      // TODO(vjpr): Exclude its node_modules.
      let {excludes: newExcludes} = getExcludes({cwd})
      updateExcludes({cwd, imlFile, newExcludes, dryRun})
    }
    if (event === 'unlinkDir') {
      console.log('Removed dir', p)
      // For now we don't remove unlinked dirs for safety.
      let {excludes: newExcludes} = getExcludes({cwd})
      updateExcludes({cwd, imlFile, newExcludes, dryRun})
    }
  }
}

function printWatchedPaths({watcher, globs, cwd}) {
  console.log('Watching:')
  console.log('cwd:', cwd)
  console.log('globs', globs)
  // DEBUG
  // Shows dirs explicitly being watched, and their children (which may or may not have their children watched).
  //   See: https://github.com/paulmillr/chokidar/issues/648#issuecomment-341093403
  const watchedPaths = watcher.getWatched() // TODO(vjpr): Not working...
  const str = prettyjson.render(watchedPaths)
  console.log('Watched paths:\n', str)
  //console.log('Glob matches:', glob.sync(globs, {cwd}))
}

////////////////////////////////////////////////////////////////////////////////

//async function getXmlJs() {
//  const json = await xml2js(xml)
//}

////////////////////////////////////////////////////////////////////////////////

const filenameGlobs = ['node_modules', 'lib', 'build', '.next', 'dist']

function shouldWatchInside(p) {
  //const match = _(filenameGlobs).some(g => minimatch(p, g, {dot: true}))
  const match = _(filenameGlobs).some(g => p.match(g + '$'))
  return !match
}

//import getExcludes from '@src/modules/get-excludes/index'
function getExcludes({cwd}) {
  const {excludes, notExcluded} = findDown({
    cwd,
    found: [],
    // Good for:
    // - dirs that are automatically excluded by IDE.
    // - dirs of packages that are not usually installed such as `examples`.
    ignoreGlobs: ['.git', 'examples', '__tests__'],
    filenameGlobs,
    // TODO(vjpr): Match partial paths.
    //pathGlobs: ['nuclide/pkg'],
  })
  return {excludes, notExcluded}
}

////////////////////////////////////////////////////////////////////////////////

function endsWith(str, suffix) {
  return str.indexOf(suffix, str.length - suffix.length) !== -1
}

////////////////////////////////////////////////////////////////////////////////

class ChokidarIgnored {
  constructor() {
    this.visits = []
  }
  visit(p, stats, shouldIgnore) {
    // TODO(vjpr): This will fire whenever a new event comes in.
    console.log('Should ignore?:', p, Boolean(shouldIgnore))
    this.visits.push({p, shouldIgnore})
  }
  getChokidarIgnoredCallback() {
    return function(p, stats) {
      return false
    }
  }
  printVisits() {
    console.log('Visited files while processing ignores:')
    console.log(
      _(this.visits)
        .map('p')
        .value(),
    )
  }
}
