import chokidar from 'chokidar'
import Debug from 'debug'
import findDown from '@src/modules/find-down'
import updateExcludes from '@src/modules/update'
import prettyjson from 'prettyjson'
import anymatch from 'anymatch'
import _ from 'lodash'

const debug = Debug('node-idea')

export default function watch({cwd, dryRun, imlFile}) {
  const ignored = new ChokidarIgnored
  const watcherOpts = {
    cwd,
    followSymlinks: false,
    ignoreInitial: true,
    // TODO(vjpr): This is strange. `@*/* should match` but we need depth=1.
    // Slows things down from watching too many files.
    //depth: 1,
    //depth: 0,
    persistent: true,
    useFsEvents: true,
    disableGlobbing: true,
    ignored: ignored.getChokidarIgnoredCallback(),
  }
  //const globs = ['.', '@*/*'] // TODO(vjpr): Not working.
  let {excludes: newExcludes, notExcluded} = getExcludes({cwd})
  //const globs = notExcluded
  const globs = '.'
  const watcher = chokidar.watch(globs, watcherOpts).on('all', changeHandler)
  watcher.on('ready', () => {
    printWatchedPaths({watcher, globs, cwd})
    ignored.printVisits()
  })
  // Run on startup.
  updateExcludes({cwd, imlFile, newExcludes, dryRun})

  ////////////////////

  function changeHandler(event, p) {
    debug('raw file event', event, p)
    if (event === 'addDir') {
      console.log('Added dir', p)
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

//import getExcludes from '@src/modules/get-excludes/index'
function getExcludes({cwd}) {
  const {excludes, notExcluded} = findDown({
    cwd,
    found: [],
    // Good for:
    // - dirs that are automatically excluded by IDE.
    // - dirs of packages that are not usually installed such as `examples`.
    ignoreGlobs: ['.git', 'examples', '__tests__'],
    filenameGlobs: ['node_modules', 'lib', 'build', '.next'],
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
    // TODO(vjpr): But how many files do they scan? Hard to tell.
    //return ['**/node_modules/**', '**/node_modules']
    //return ['**/node_modules**']

    // This can be called twice.
    //   See https://github.com/paulmillr/chokidar#path-filtering
    // NOTE: chokidar stops searching for inside a dir if its ignored.
    //   See https://github.com/paulmillr/chokidar/issues/648.
    return (p, stats) => {
      // Ignores the dir and its contents.
      //const shouldIgnore = anymatch('**/node_modules**', p)
      // Ignores the dir, but not its contents.
      const shouldIgnore = anymatch('**/node_modules/**', p)
      this.visit(p, stats, shouldIgnore) // Callback for instrumentation.
      return shouldIgnore
    }
  }
  printVisits() {
    console.log('Visited files while processing ignores:')
    console.log(_(this.visits).map('p').value())
  }
}
