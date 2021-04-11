const path = require('path')
const resolver = require('metro-resolver')
const blacklist = require('metro-config/src/defaults/blacklist')
const fs = require('fs')

module.exports = {
  resetCache: true,
  projectRoot: __dirname,
  watchFolders: [
    getRepoRoot(),
    path.resolve(__dirname, '.'),
    path.resolve(__dirname, './node_modules'),
  ],
  resolver: {
    // TODO(vjpr): Add all ignores.
    // From: https://stackoverflow.com/a/41963217/130910
    // TODO(vjpr): Sync with `pnpm-workspace` ignores too.
    blacklistRE: blacklist([
      /.*\/default\/.*/,
      /.*\/nest-orig\/.*/,
      /.*\/\.cache\/.*/,
    ]),
    useWatchman: true,
    // Why?(
    transformer: {
      assetRegistryPath: path.resolve(__dirname, 'assets'),
      getTransformOptions: async () => ({
        transform: {
          experimentalImportSupport: false,
          inlineRequires: false,
        },
      }),
    },
    // NOTE: Relative and absolute imports must be handled by `resolveRequest` or they will fail.
    //   See the `isDirectImport` in metro-resolver`.
    //   We use the `resolver.resolve` with `resolveRequest = null` to get around this.
    resolveRequest: (ctx, moduleName, platform) => {
      // Log the module being resolved.
      //console.log({moduleName})

      /*
        Default impl checks whether the logical path is in HasteFS.
        HasteFS is populated by watchman that doesn't add symlinks,
          so only real files found in the `watchFolders` are available in HasteFS.
        E.g.
        In haste map => `<repo-root>/node_modules/.pnpm/.../foo/package.json`
        Not in haste map => `<project-root>/node_modules/foo/package.json`

        So we simply override this behaviour.
      */
      const doesFileExist = (filePath) => {
        try {
          // When resolving `pnpm` uses symlinks.
          // NOTE: This is way too slow because hundreds of checks are done per file per extension per platform.
          const realpath = fs.realpathSync(filePath)
          const exists = ctx.doesFileExist(realpath)
          return exists
        } catch (e) {
          if (e.code === 'ENOENT') return
          throw e
        }
      }

      // The Node resolution algorithm will search upwards from the realpath. Metro doesn't follow realpaths.
      // We must use the realpath for origins because pnpm doesn't store dependencies of packages in `node_modules`, but in a level above.

      // Seems `originModulePath` must always must be a file.
      //   So we append a '.' if its a directory.
      let originModulePath = fs.realpathSync(ctx.originModulePath)
      if (ctx.originModulePath.endsWith('/.')) originModulePath += '/.'

      // `ctx.resolveRequest` refers to the function we are currently in.
      // If we remove it, then it will run the default resolver instead of your custom one.
      // See: https://github.com/facebook/metro/blob/master/packages/metro-resolver/src/resolve.js#L95
      return resolver.resolve(
        {...ctx, resolveRequest: null, originModulePath, doesFileExist},
        moduleName,
        platform,
      )
    },
    extraNodeModules: new Proxy(
      {},
      {
        get: (target, name) => {
          if (target.hasOwnProperty(name)) {
            return target[name]
          }
          //return path.join(__dirname, `node_modules/${name}`)
        },
      },
    ),
    sourceExts: ['ts', 'tsx', 'js', 'jsx'],
  },
}

console.log(module.exports)

////////////////////////////////////////////////////////////////////////////////

function getRepoRoot() {
  const findUp = require('find-up')
  // This should be the first file invoked by `node` process.
  const startSearchingFrom = process.mainModule.filename
  console.log({startSearchingFrom})
  const rootFile = findUp.sync('pnpm-workspace.yaml', {cwd: startSearchingFrom})
  //console.log('Using root file', rootFile)
  if (rootFile) {
    return require('path').dirname(rootFile)
  }
  return null
}
