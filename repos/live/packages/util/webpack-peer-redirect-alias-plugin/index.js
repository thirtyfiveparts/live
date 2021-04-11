// Taken from `webpack.AliasPlugin`.

import _ from 'lodash'
import createInnerCallback from './create-inner-callback'
import readPkgUp from 'read-pkg-up'
import Debug from 'debug'
import getVersionedPkgRootPathForRequest from './get-versioned-pkg-root-path-for-request'
const debug = Debug('peer-redirect-alias-plugin')

export default class PeerRedirectAliasPlugin {
  constructor(source, options, target) {
    // TODO(vjpr): These should be fixed.
    // For ordering see:
    //   https://github.com/webpack/enhanced-resolve/blob/master/lib/ResolverFactory.js
    // We use `before` to make sure it runs before AliasPlugin.
    this.source = source || 'before-described-resolve'
    this.target = target || 'resolve'
    this.pkgNamesToAvailableVersions = options.pkgNamesToAvailableVersions || {}
  }

  apply(resolver) {
    const {pkgNamesToAvailableVersions} = this
    const target = resolver.ensureHook(this.target)

    resolver
      .getHook(this.source)
      .tapAsync('PeerRedirectAliasPlugin', function(
        request,
        resolveContext,
        callback,
      ) {
        // E.g. `import 'react'` => 'react'.
        // The word `inner` is used because webpack wraps a request.
        const innerRequest = request.request || request.path
        if (!innerRequest) return callback()

        const {
          pkgName,
          issuerPkgName,
          versionedPkgRootPath,
        } = getVersionedPkgRootPathForRequest({
          request,
          pkgNamesToAvailableVersions,
        })
        if (!versionedPkgRootPath) return callback()

        // `react/Foo`
        //        ^^^
        const moduleSubDir = innerRequest.substr(pkgName.length)

        // `react/Foo` -> `abs/path/to/react/Foo`
        const newInnerRequestStr = versionedPkgRootPath + moduleSubDir

        const newReq = Object.assign({}, request, {
          request: newInnerRequestStr,
        })

        const message = `resolved ${issuerPkgName}'s peer dep '${pkgName}' to '${newInnerRequestStr}'`
        debug(message)

        const resolverCallback = (err, result) => {
          if (err) return callback(err)
          // Don't allow other aliasing or raw request
          if (result === undefined) return callback(null, null)
          callback(null, result)
        }

        return resolver.doResolve(
          target,
          newReq,
          message,
          resolveContext,
          resolverCallback,
        )
      })
  }
}
