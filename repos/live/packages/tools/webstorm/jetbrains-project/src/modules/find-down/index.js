// List all files in a directory in Node.js recursively in a synchronous fashion.
import _, {includes} from 'lodash'
import minimatch from 'minimatch'
import path, {join} from 'path'
import fs from 'fs'
import jsonfile from 'jsonfile'
import Debug from 'debug'
import trike from 'trike'
const debug = Debug('find-down')

export default function findDownShallow({filenameGlobs, ignoreGlobs, relPathGlobs, cwd}) {
  cwd = cwd || process.cwd()
  const dir = ''
  const excludes = []
  const notExcluded = []
  const visitedDirs = []
  const visitedFiles = []
  const symlinkCycleLog = []

  relPathGlobs = relPathGlobs || []

  loop({dir})
  return {excludes, notExcluded, visitedFiles, visitedDirs}

  function loop({dir}) {
    debug('Processing directory', dir)

    // TODO(vjpr): This can fail after directory move.
    /*
    Writing /Users/Vaughan/dev-live/.idea/dev-live.iml
    Directory moved require-tools
    Error: ENOENT: no such file or directory, scandir '/Users/Vaughan/dev-live/require-tools'
        at Object.fs.readdirSync (fs.js:904:18)
        at loop (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/src/modules/find-down/index.js:24:22)
        at loop (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/src/modules/find-down/index.js:71:9)
        at findDownShallow (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/src/modules/find-down/index.js:19:3)
        at getExcludes (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/src/modules/watch.js:122:35)
        at updateFn (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/src/modules/watch.js:41:35)
        at invokeFunc (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/node_modules/.registry.npmjs.org/lodash/4.17.4/node_modules/lodash/lodash.js:10350:23)
        at trailingEdge (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/node_modules/.registry.npmjs.org/lodash/4.17.4/node_modules/lodash/lodash.js:10397:18)
        at Timeout.timerExpired [as _onTimeout] (/Users/Vaughan/dev-vjpr/packages/jetbrains-project/node_modules/.registry.npmjs.org/lodash/4.17.4/node_modules/lodash/lodash.js:10385:18)
        at ontimeout (timers.js:475:11)
   */

    let [e1, files] = trike(fs.readdirSync.bind(fs), join(cwd, dir))
    if (e1) {
      // Waiting for this error may slow things down.
      if (e1.code === 'ELOOP') {
        console.log('When reading dir, a cyclic symlink was encountered. E.g. /subdir/circular -> /subdir')
        console.log(dir)
        files = []
      } else {
        throw e1
      }
    }

    const dirsToSearch = []
    const foundInThisDir = []

    visitedDirs.push(dir)

    const dirContainsPackageJson = files.includes('package.json')

    // Disabled for now.
    //preEmptivelyExcludeDir()


    for (const file of files) {
      const relPath = path.join(dir, file)

      visitedFiles.push(relPath)

      const didMatchIgnore = _(ignoreGlobs).some(g =>
        minimatch(file, g, {dot: true}),
      )
      if (didMatchIgnore) continue
      const didMatchRelPathGlob = _(relPathGlobs).some(g =>
        minimatch(relPath, g, {dot: true}),
      )
      if (didMatchRelPathGlob) continue
      const didMatchGlob = _(filenameGlobs).some(g =>
        minimatch(file, g, {dot: true}),
      )
      if (didMatchGlob) {
        foundInThisDir.push(relPath)
        continue
      }
      const absPath = join(cwd, relPath)

      let [err, stats] = getStats(absPath)
      if (err && err.code === 'ENOENT') {
        // File no longer exists. Skip.
        continue
      }
      if (err) throw err

      /*
      This is to fix the bug in dev-live

      Error: ELOOP: too many symbolic links encountered, scandir '/Users/Vaughan/dev-live/chokidar/test-fixtures/135/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular/subdir/circular'
      */

      // For this to work, you need to change getStats to use lstat.
      if (stats.isSymbolicLink()) {
        const [e1, realpath] = trike(fs.realpathSync.bind(fs), absPath)
        if (e1 && e1.code === 'ENOENT') continue
        if (e1) throw e1
        if (symlinkCycleLog.includes(realpath)) {
          // Cycle
          // NOTE: This breaks if symlinks are setup like so: `public/public-symlink` -> `public/public-local` -> `~/dev/public`
          //   We handle the error instead.
          //console.log('cycle!')
          //continue
        }
        symlinkCycleLog.push(realpath)

        const [e, stat] = trike(fs.statSync.bind(fs), realpath)
        if (!e) {
          // TODO(vjpr): Handle symlink broken.
          stats = stat
        }
      }

      if (stats.isDirectory()) {
        notExcluded.push(relPath)
        dirsToSearch.push(relPath)
      }
    }

    excludes.push(...foundInThisDir)

    // Stop walking dirs if we found a match. Save time.
    if (!shouldNotSearchBelowDir(dir, files)) {
      for (const dir of dirsToSearch) {
        loop({
          dir,
        })
      }
    }

    // Don't recur if we found a `package.json` file.
    function shouldNotSearchBelowDir(parentDir, files) {
      if (_.includes(files, 'lerna.json')) {
        const p = join(cwd, parentDir, 'lerna.json')
        const lernaJson = jsonfile.readFileSync(p, {throws: false})
        if (lernaJson) {
          // These are globs to packages we should search.
          // TODO(vjpr): We could limit searching to these paths if found.
          lernaJson.packages
        }
      }

      //if (_.includes(['pkg', 'packages'], dir)) return false

      // Prevent recursing when there is a `package.json`, and its not a monorepo (i.e. `lerna.json`).
      //if (_.includes(files, 'package.json') && !_.includes(files, 'lerna.json')) return true

      // DEBUG
      return false
    }

    function preEmptivelyExcludeDir() {
      if (dirContainsPackageJson) {
        // If we find a `package.json` we pre-emptively exclude.
        const absNodeModulesPath = join(dir, 'node_modules')
        foundInThisDir.push(absNodeModulesPath)
      }
    }
  }
}

function getStats(p) {
  // NOTE: File may have been deleted by the time we look at it.
  // E.g. Temp files such as `shrinkwrap.yaml.956376071`.

  // TODO(vjpr): `statSync` could be slower than lstat,
  // but `isDirectory` doesn't work on symlinks otherwise.
  return trike(fs.lstatSync.bind(fs), p)
}
