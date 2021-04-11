import Debug from 'debug'
const debug = Debug('ignore-npm-linked-packages')

//
// Ignore `npm linked` packages - packages outside of my root.
// You usually don't want to transpile these.
// It could really slow your app down too if you try to compile large concatenated
//   `dist` stuff. E.g. `flow-runtime` was an issue when linked.
//
// But, if we are using a linked `packages/org-symlink` dir, then we want it to be transpiled.
//

let repoRoot = findRepoRoot()

// E.g. ['packages/public-symlink']
module.exports = function makeIgnoreNpmLinkedPackages(packagesRoots) {
  return f => {
    debug(f)

    const isInsideRepoRoot = f.startsWith(repoRoot)
    if (isInsideRepoRoot) {
      debug('not ignoring because isInsideRepoRoot')
      return false
    }

    const isInsideAPackagesDirSymlinkRealPath = packagesRoots.some(
      packagesDirName => {
        const {
          packagesDirSymlinkRealPath,
          packagesDirSymlinkExists,
        } = getPackagesDirSymlinkRealPath(packagesDirName)

        debug({packagesDirSymlinkExists, packagesDirSymlinkRealPath})

        const isInsidePackagesDirSymlinkRealPath = () =>
          packagesDirSymlinkExists
            ? f.startsWith(packagesDirSymlinkRealPath)
            : undefined

        return isInsidePackagesDirSymlinkRealPath()
      },
    )

    if (isInsideAPackagesDirSymlinkRealPath) {
      debug('not ignoring because isInsideAPackagesDirSymlinkRealPath')
      return false
    }

    debug(
      'IGNORING because symlinked (and not inside repo root and not inside public-symlink)',
    )
    // Not inside repo root and not inside public-symlink.
    return true
  }
}

// E.g. packagesDirName = packages/public-symlink
function getPackagesDirSymlinkRealPath(packagesDirName) {
  const fs = require('fs')
  const {join} = require('path')

  // TODO(vjpr): Don't rely on cwd, search for the repo root!
  //   There are a few places we rely on it.
  const cwd = repoRoot
  const packagesDirPath = join(cwd, packagesDirName)
  const packagesDirSymlinkExists = fs.existsSync(packagesDirPath)
  let packagesDirSymlinkRealPath
  if (packagesDirSymlinkExists) {
    packagesDirSymlinkRealPath = fs.realpathSync(packagesDirPath)
  }

  return {packagesDirSymlinkRealPath, packagesDirSymlinkExists}
}

// TODO(vjpr): Can we optimize this?
// TODO(vjpr): Duplicated in `live-cli-global`.
function findRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootMarkerFile = findUp.sync('pnpm-workspace.yaml')
  if (!rootMarkerFile) return process.cwd()
  return path.dirname(rootMarkerFile)
}
