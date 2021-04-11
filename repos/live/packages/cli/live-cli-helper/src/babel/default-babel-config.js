const ignoreNpmLinkedPackages = require('./ignore-npm-linked-packages')
const debug = require('debug')('live-cli-helper')
const debugVerbose = require('debug')('live-cli-helper:verbose')
const fs = require('fs')
const path = require('path')

// NOTE: Be careful of how expensive these filters are. Most expensive at bottom please.
const ignores = [
  // We must use this because `babel` sets the ignore to anything outside the current directory.
  // When using symlinks, the file paths will be relative to their realpath.
  /node_modules/,

  // TODO(vjpr): Make a function warn if there are files taking a long time to compile.
]

// Must go at end, just for logging purposes.
// Also, we want expensive filter to go last.
// And some filters should only run if they are not ignored.
const getFinalIgnores = packagesRoots => [
  ignoreNpmLinkedPackages(packagesRoots),
  warnOnFileSize,
  logger,
]

exports.getFinalBabelIgnores = getFinalIgnores

function getSymlinkedPackagesAbsPath(repoRoot) {
  // TODO: Need to add all symlink package folders. They are in the `live.config.js` file
  const pkgFolders = ['live']
  return pkgFolders.map(p => {
    const pkgsRealPath = fs.realpathSync(path.join(repoRoot, 'repos/', p))
    return path.join(pkgsRealPath, '/**')
  })
}

exports.getDefaultBabelConfig = ({repoRoot}) => ({
  // Set to `false` to disable using root `babel.config.js` (note: local `.babelrc` merges with this config).
  //
  // ~NOTE: We would set to false if we need to per-package configs.~
  //   We do per-package configs using overrides in `babel.config.js` for now.
  // We need to set to false for `@live/cli` it seems.
  configFile: true,

  //
  // See https://github.com/facebook/jest/issues/6053#issuecomment-383632515
  //   and https://github.com/babel/babel/pull/7784/files
  //
  // I think it allows `.babelrc` files to be found in packages.
  // NOTE: `repoRoot` is for when we are running inside an app in a monorepo, but want other packages compiled with the root config.
  babelrcRoots: [
    repoRoot,
    '.',
    'packages/**',
    ...getSymlinkedPackagesAbsPath(repoRoot),
  ].filter(Boolean),

  // TODO(vjpr): Why do we set this do true? I don't think we use it.
  // 20181114Wed: This will be used when we want to use local `.babelrc` files for file-relative configs, like in @live/cli.
  babelrc: true,

  ignore: ignores,

  // false - clears cache, doesn't use it.
  // true - uses cache.
  // NOTE: Does not set cache directory. Use `process.env.BABEL_CACHE_PATH`.
  // NOTE: `process.env.BABEL_DISABLE_CACHE` disables cache but does not clear it.
  cache: true,

  // Add ts and tsx.
  extensions: ['.es6', '.es', '.jsx', '.js', '.mjs', '.ts', '.tsx'],

  //extends
})

////////////////////////////////////////////////////////////////////////////////

function warnOnFileSize(f) {
  const size = sizeInMB(f)
  //console.log({f, size: size + 'Kb'})
  if (size > 50) {
    console.log('\n\n\n\n\n')
    console.log('WARNING: @babel/register is compiling a large file.')
    console.log({f, size: size + 'Kb'})
    console.log('\n\n\n\n\n')
  }
  // Always return false because this is just for logging.
  return false
}

function sizeInMB(f) {
  var fs = require('fs') // Load the filesystem module
  var stats = fs.statSync(f)
  var fileSizeInBytes = stats['size']
  //Convert the file size to megabytes (optional)
  //var fileSizeInMegabytes = fileSizeInBytes / 1000000.0
  var fileSizeInKilobytes = fileSizeInBytes / 1000.0
  return fileSizeInKilobytes
}

function logger(f) {
  //console.log(ignores.some(p => p.test(f)))
  //console.trace() // Good way to test.
  debugVerbose('Processing:', f)
  return false
}
