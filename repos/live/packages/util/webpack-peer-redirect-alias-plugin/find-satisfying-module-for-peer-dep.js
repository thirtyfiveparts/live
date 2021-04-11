import Debug from 'debug'
import readPkgUp from 'read-pkg-up'
import _ from 'lodash'
import semver from 'semver'
const debug = Debug('find-satisfying-module-for-peer-dep')

export default function findSatisfyingPeerDep({
  issuerPjson,
  pkgName,
  pkgVersions,
}) {
  const {peerDependencies, name: issuerName} = issuerPjson
  if (!peerDependencies) return
  // TODO(vjpr): Maybe search devDeps too...
  // https://github.com/react-component/animate/blob/master/package.json
  const peerVersionRange = peerDependencies[pkgName]
  return findSatisfyingVersion({
    issuerName,
    pkgName,
    peerVersionRange,
    pkgVersions,
  })
}

// TODO(vjpr): "peer dep" text should be changed or confiburable because we use it for root level modules too.
export function findSatisfyingVersion({
  issuerName,
  pkgName,
  peerVersionRange,
  pkgVersions,
}) {
  const str = `${issuerName} wants ${pkgName}@${peerVersionRange}. Available: ${pkgVersions}`
  //debug(str)
  const satisfyingVersion = _(pkgVersions).find(availableVersion => {
    availableVersion = availableVersion + '.999.999' // DEBUG
    const satisfies = semver.satisfies(availableVersion, peerVersionRange, true)
    return satisfies
  })
  //if (satisfyingVersion) debug(`Found satisfying version: ${satisfyingVersion}`)
  return satisfyingVersion
}

export function getIssuerPkgJson({issuerPath}) {
  // TODO(vjpr): This is going to slow things down.
  const res = readPkgUp.sync({cwd: issuerPath})
  return res
}

//function findSatisfyingPeerDep1({
//  resolver,
//  request,
//  callback,
//  target,
//}) {
//  const {issuer} = request.context
//  const {context} = request
//
//  // Only look at deps of deps requests.
//  //if (!issuer) return callback()
//
//  const {name} = request.descriptionFileData
//
//  if (request.request === 'react-router/Route') {
//    console.log(request)
//
//    console.log(request.request)
//
//    console.log({
//      context,
//      issuerName,
//      peerDependencies,
//      name,
//      issuer,
//      path: request.path,
//      //descriptionFileData: request.descriptionFileData,
//    })
//  }
//
//  if (!versionedDeps[name]) {
//    return callback()
//  }
//
//  if (!peerDependencies) return callback()
//  const range = peerDependencies[name]
//  // Map to matched range.
//
//  //return callback()
//
//  for (const availableVersion of versionedDeps[name]) {
//    // TODO(vjpr): Only matching against major...may cause issues. We should check the actual versions.
//    const ver = availableVersion + '.999.999'
//    if (semver.satisfies(ver, range, true)) {
//      const escapedName = name // DEBUG
//
//      const resolved = resolveSubDep(
//        name,
//        `@version/${escapedName}-v${availableVersion}`,
//      )
//
//      console.log('RESOLVED', resolved)
//      //console.log(request)
//
//      const newReq = Object.assign({}, request, {path: resolved})
//
//      //return callback()
//
//      return resolver.doResolve(
//        target,
//        newReq,
//        `resolved ${issuerName}'s peer dep '${name}' to '${resolved}'`,
//        createInnerCallback(function(err, result) {
//          if (arguments.length > 0) return callback(err, result)
//          // don't allow other aliasing or raw request
//          callback(null, null)
//        }, callback),
//      )
//    }
//  }
//
//  return callback()
//}
