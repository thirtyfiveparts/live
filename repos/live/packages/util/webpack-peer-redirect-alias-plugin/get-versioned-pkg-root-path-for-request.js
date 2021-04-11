import findSatisfyingModuleForPeerDep, {
  getIssuerPkgJson,
  findSatisfyingVersion,
} from './find-satisfying-module-for-peer-dep'
import getPathToVersionedPkg from './get-path-to-versioned-pkg'
import path, {join} from 'path'
import _ from 'lodash'

// (!onlyModule && startsWith(innerRequest, name + '/'))
// if (innerRequest !== alias && !startsWith(innerRequest, alias + '/')) {

export default function getVersionedPkgRootPathForRequest({
  request,
  pkgNamesToAvailableVersions,
}) {
  const innerRequest = request.request

  const availablePkg = _(pkgNamesToAvailableVersions).findKey((v, k) => {
    /*
      Important cases:
      - react
      - react-router
      */
    return innerRequest === k || innerRequest.startsWith(k + '/')
    // TODO(vjpr): Other tools could use absolute paths. Should we redirect them too? Or show warnings. Be careful though because it may be us rewriting from module-path to abs-path.
  })
  if (!availablePkg) return {}

  const pkgVersions = pkgNamesToAvailableVersions[availablePkg]
  // [3, 4]

  const issuerPath = request.context.issuer
  const {pkg: issuerPjson, path: issuerPjsonPath} = getIssuerPkgJson({
    issuerPath,
  })
  const issuerPkgName = issuerPjson.name

  const repoRoot = process.cwd()

  // TODO(vjpr): Should this be repo root? What if we run from a different cwd?
  const isRootRequire = issuerPjsonPath === join(repoRoot, 'package.json')

  const pkgName = availablePkg

  let version = null

  if (isRootRequire) {
    // searches deps to find what to use for top level deps.
    version = findSatisfyingVersion({
      issuerName: issuerPkgName,
      pkgName,
      peerVersionRange: issuerPjson.dependencies[pkgName], // TODO(vjpr): make more flexible.
      pkgVersions,
    })
  } else {
    version = findSatisfyingModuleForPeerDep({
      issuerPjson,
      pkgName,
      pkgVersions,
    })
  }

  // Use default - ensure only one instance.
  // Sometimes packages might not include peerDeps.
  if (!version) {
    version = pkgVersions[0]
    console.log(pkgName, version)
  }

  if (!version) return {}

  const versionedPkgRootPath = getPathToVersionedPkg({
    name: availablePkg,
    version,
  })

  // TODO(vjpr): Check its not already aliased...
  //   We don't need to do it really though because we are always doing an absolute request rewrite.

  return {pkgName, issuerPkgName, versionedPkgRootPath}
}
