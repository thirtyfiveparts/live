let debug

// TODO(vjpr): We could use source maps instead? But then its a more complicated plugin and more stat calls.
//   But now we are now reading all the source maps anyway...

export default function (isApp) {
  // Don't add require hook to apps. Apps are big and will always be developed with babel-register.
  //   We are only interested in speeding up quick CLI utils for now.
  // TODO(vjpr): This is not always true. Sometimes we will use the es5 export directly for speed if it is involved in startup critical path...
  if (isApp) return

  // Enable this to check if files which need to be transpiled have been.
  // It may slow down builds.
  // `babel-plugin-manifest-mtime` must also be used in the transpiled pkg to ensure it works.
  // NOTE: If we run `live` then these errors will be irrelevant sometimes.
  // Enable by default - makes things safer.
  // PERF: May slow things down.
  if (process.env.NO_TRANSPILE_CHECKER) return
  //if (!process.env.TRANSPILE_CHECKER) return

  main()
}

// Only transpiled extensions are necessary - not `.ts`.
const extensions = ['.js']

function main() {
  // --------------------

  // We use commonjs requires because we can't use `"@babel/plugin-transform-modules-commonjs", {lazy: true}`.
  //   See an explanation in `require.extensions`.

  // PERF: statSync for every require.
  const findUp = require('find-up')
  const fs = require('fs')
  const path = require('path')
  const {join} = require('path')
  const c = require('chalk')
  const {format: timeagoFormat} = require('timeago.js')
  const Debug = require('debug')
  debug = Debug('transpile-status-checker')

  // --------------------

  // Maps dirs to their manifest files.
  // NOTE: We can't assume that only one tree has one manifest.json. Packages may be nested, and maybe we want to compile all files in one-go. But actually, thss is unlikely.
  //   Also note, that this will check every file, not just ones that should be transpiled. So we actually do need it.
  const dirToManifestPathCache = {}

  function readManifest(filename) {
    const manifestFile = getManifestFilenameCached()

    ////////////////////

    function getManifestFilenameCached() {
      const manifestPath = 'babel-manifest.json'
      const dir = path.dirname(filename)
      let manifestFile = dirToManifestPathCache[dir]
      if (!manifestFile) {
        // NOTE: We include package.json so we stop searching at closest package.json.
        // TODO(vjpr): Must be synced with the babel-plugin-mtime.
        manifestFile = findUp.sync([manifestPath, 'package.json'], {
          cwd: filename,
        })
        // Stop when we reach a `package.json` file without finding a manifest file.
        if (manifestFile.endsWith('package.json')) manifestFile = 'not-found'
        dirToManifestPathCache[dir] = manifestFile
      }
      return manifestFile
    }

    if (manifestFile === 'not-found') return {}

    ////////////////////

    let manifest
    try {
      manifest = require(manifestFile)
    } catch (e) {
      if (e.code === 'MODULE_NOT_FOUND') {
        console.log('Manifest not found. May need transpilation.')
        return
      }
      throw e
    }

    return {manifest, manifestFile}
  }

  // TODO(vjpr): Problem with this hook is we can't check if its a relative require or whether we should skip stat call.
  // We can only check paths in dir.
  extensions.map(ext => {
    const original = require.extensions[ext]
    require.extensions[ext] = hook

    function hook(module, filename) {
      // TODO(vjpr): We need to serialize the babel config too!
      //   Maybe babel has some function to do that.

      // NOTE: If `['@babel/plugin-transform-modules-commonjs', {lazy: true}]`,
      //   this will cause problems because `readManifest` will lazily call the top-level requires/imports which will be redirected to here. This causes requires to not be correctly loaded.
      //   We disable it in 'package.json'.

      compareModifiedTimes()
      original(module, filename)

      function compareModifiedTimes() {
        const isInNodeModules = filename.match('node_modules')
        if (isInNodeModules) return

        const {manifest, manifestFile} = readManifest(filename)

        if (!manifest) return
        const manifestDir = path.dirname(manifestFile)

        const root = path.resolve(manifestDir, '..') // Assume `lib/babel-manifest.json`.
        const relSourceFilename = getSourceFileFromTranspiledFile(
          filename,
          root,
        )
        if (!relSourceFilename) {
          // Must be a file that was not transpiled because it had no source map.
          return
        }

        const absSourceFilename = join(root, relSourceFilename)

        const manifestFileKey = relSourceFilename
        const mtimeWhenCompiled = manifest[manifestFileKey]
        // Not in manifest. Ignore.
        if (!mtimeWhenCompiled) return

        if (!fs.existsSync(absSourceFilename)) {
          console.warn(
            `In manifest.json, '${absSourceFilename}' no longer exists. Maybe it was renamed/moved/deleted. It will be removed.`,
          )
          removeNonExistentEntryFromManifest({
            manifestFileKey,
            manifest,
            manifestFile,
          })
          return // Ignore
        }
        const mtimeNow = fs.statSync(absSourceFilename).mtimeMs

        // DEBUG
        debug(absSourceFilename)
        debug(mtimeWhenCompiled)
        debug(mtimeNow)
        // --

        // prettier-ignore
        if (mtimeWhenCompiled !== mtimeNow) {
          let msg = c.red(`Source file has been modified since it was last compiled.\n`)
          msg += c.red.bold('Filename: ' + absSourceFilename + '\n')
          msg += c.cyan('Please recompile by running (include brackets for sub-shell):\n')
          msg += c.cyan.bold(`  (cd ${root} && npm run build)\n`)
          // NOTE: This would only work for live-cli stuff. We use cli-helper elsewhere. But usually we only AOT transpile the live-cli. But we might AOT transpile other clis or tools.
          //msg += c.grey(`You can also try 'npm run dev-deps' from 'live-cli'\n`)
          // TODO(vjpr): Say npm run dev-deps --prefix=path-to-master-tool
          // --
          msg += c.grey(`Source modified date when last compiled: ${timeagoFormat(mtimeWhenCompiled)}\n`)
          msg += c.grey(`Source modified date: ${timeagoFormat(mtimeNow)}\n`)
          msg += c.grey(`Manifest file: ${manifestFile}`)
          console.error(msg)
          throw new Error('Source file was modified after it was compiled.')
        }
      }
    }
  })
}

// TODO(vjpr): Hacky for now. `source-map` has no sync api so I parked this for now.
function getSourceFileFromTranspiledFile(filename, root) {
  // Experimental. Prevents overwriting `Error.prepareStackTrace` which we might use somewhere.
  // See: https://nodejs.org/api/cli.html#cli_enable_source_maps
  //const map = module.findSourceMap(filename)

  /*

  - lib
    - index.js
    - babel-manifest.json
  - src
    - index.ts

  */

  const sourceMap = readSourceMap(filename)
  if (sourceMap) {
    const path = require('path')
    const sourceRelFromTranspiledFile = sourceMap?.sources[0]
    const absSourceFilename = path.resolve(
      path.dirname(filename),
      sourceRelFromTranspiledFile,
    )
    return absSourceFilename.replace(root + '/', '')
  }

  // NOTE: I don't think we need this.
  // We also need to change from .js to .ts. We must use source maps!
  // Hacky. This assumes the output dir matches.
  // ---
  //return filename.replace('/lib/', '/src/')
}

////////////////////////////////////////////////////////////////////////////////

function readSourceMap(filename) {
  const fse = require('fs-extra')
  return fse.readJsonSync(filename + '.map', {throws: false})
}

////////////////////////////////////////////////////////////////////////////////

function removeNonExistentEntryFromManifest({
  relFilename,
  manifest,
  manifestFile,
}) {
  delete manifest[relFilename]
  const fse = require('fs-extra')
  fse.writeJsonSync(manifestFile, manifest)
}
