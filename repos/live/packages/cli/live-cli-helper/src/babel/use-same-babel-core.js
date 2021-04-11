const Diff = require('diff')
const chalk = require('chalk')
const fs = require('fs')
const _ = require('lodash')


// TODO(vjpr): WE NEED TO CHECK FOR SAME VERSION. THIS PATH DOES NOT HAVE THE VERSION.
//   This needs to be moved into the require hook.
// TODO(vjpr): Must check that `filename` exists. The same version of the symlinked package must be installed in this repo.
// When using `shared-workspace-packages` it only needs to be installed in any package, and it will appear in correct spot.
//if (!fs.existsSync(babelCorePkgPath)) {
//  let msg = `'use-same-babel-core' require hook is enabled. It will rewrite @babel/core to use the local repos when you are symlinking.`
//  msg += `However ${babelCorePkgPath} doesn't exist. Please ensure same version is installed in local repo as in symlinked repo.`
//  throw new Error(msg)
//})
// ---

// When symlinking `packages/public` we need to use the same `@babel/core` version.
module.exports = function useSameBabelCore({repoRoot}) {

  ////////////////////////////////////////////////////////////////////////////////
  // Moved this from the top.

  // TODO(vjpr): Not needed anymore I think.
  // TODO(vjpr): We should ensure that the env var is always set.
  //const repoRoot = process.env.LIVE_CLI_REPO_ROOT || process.cwd()

  const babelCorePkgPath =
    repoRoot + '/node_modules/.registry.npmjs.org/@babel/core'
  const babelCoreFinder = /^(.*)(\/node_modules\/\.registry\.npmjs\.org\/@babel\/core)/

  ////////////////////////////////////////////////////////////////////////////////

  const Module = require('module')

  const noopPath = require.resolve('./no-op')

  const oldResolveFilename = Module._resolveFilename
  Module._resolveFilename = function(request, parent, isMain) {
    //console.log({request, parent})

    //hook({request, parent, isMain})
    //hook2({request, parent, isMain})

    ////////////////////

    // TODO(vjpr): This could be moved to a different file.
    //  Its unrelated to this. I just put it here because I was lazy.

    // See next-config-shared/modules/externals
    const repoRootPlaceholder = 'REPO_ROOT'
    if (request.startsWith(repoRootPlaceholder)) {
      request = request.replace(repoRootPlaceholder, process.cwd())
    }

    ////////////////////

    // TODO(vjpr): If the dep can't be found there is error pointing here.
    //   Maybe it can't be found. Check paths in parent.
    // TODO(vjpr): Rewrite the stack trace with a message about this.
    //   It can be really confusing.
    try {
      let filename = oldResolveFilename.call(this, request, parent, isMain)

      // Ignore css required when running node.js
      // Say you have a next.js page that imports a package like `page-foo`.
      // If you `import 'third-party-package/style.css'` you will need to resolve it to a no-op.
      // It seems like webpack isn't used when when importing packages into something in the `pages` dir.
      // I think webpack only runs on the `pages` dirs.
      if (filename.endsWith('.css')) return noopPath
      // --

      ////////////////////

      // TODO(vjpr): This is bad! It won't work for different versions.
      //   Use something more robust.
      //   But, we should throw an error/big-warning if there are different versions.

      // https://regexr.com/3qkdp
      const replacer = repoRoot + '$2'

      if (babelCoreFinder.test(filename)) {
        const before = filename
        filename = filename.replace(babelCoreFinder, replacer)
        const after = filename

        if (before !== after) {
          //const diff = Diff.diffChars(before, after)
          //console.log(printDiff(diff))
          // TODO(vjpr): This message needs to be silenced, or show once aggregated, or debounced.

          printMessage({before, after})
        }
      }

      return filename
    } catch (e) {
      // A lot of these are handled upwards so we can't print anything unless it doesn't eventually get handled.
      // TODO(vjpr): We could modify the error though so if it is unhandled it gets thrown. But this is complex.
      //console.error('NOTE: Ignore "live-cli-helper/src/babel/use-same-babel-core.js" in the stack trace. It is a hook.')
      // --

      // TODO(vjpr): Show the context if possible...
      //   `resolve-from` is hard to track down the from dir.

      // Sometimes this is helpful because require hack does some freaky stuff.
      // But lots of other stuff handles these exceptions...
      //console.log(e, request, parent)
      throw e
    }
  }
}

function printDiff(diff) {
  let str = ''
  diff.forEach(function(part) {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added ? 'green' : part.removed ? 'red' : 'grey'
    str += chalk[color](part.value)
  })
  return str
}

////////////////////////////////////////////////////////////////////////////////

let count = 0
const debouncedFunction = _.debounce(({before, after}) => {
  console.log()
  console.log(`Message similar to below appeared ${count} times:`)
  console.log('Use same babel-core when symlinked - rewrote require from/to')
  console.log(before)
  console.log(after)
  console.log('---')
  count = 0
}, 1000)

function printMessage({before, after}) {
  count++
  debouncedFunction({before, after})
}
