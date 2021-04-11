import pkgDir from 'pkg-dir'
import resolveFrom from 'resolve-from'

export default function getPathToVersionedPkg({name, version}) {
  // TODO(vjpr): Needs to be escaped name!!! Like in `version-publish`.
  const escapedName = name // DEBUG

  //const namespace = '@version/'
  const namespace = ''
  const versionedPackageName = namespace + `${escapedName}-v${version}`

  const resolvedDep = resolveSubDep(
    name,
    versionedPackageName,
  )
  return resolvedDep
}

const repoRoot = process.cwd()

// Get the actual package - `app/node_modules/@version/react-v15/node_modules/react`.
//
// E.g.
// - name = react
// - versionedName = @version/react-v15
function resolveSubDep(name, versionedName) {
  // TODO(vjpr): Only looks for peer deps in root dir for now. Make configurable.
  const versionedRoot = pkgDir.sync(resolveFrom(repoRoot, versionedName))
  // versionedRoot = app/node_modules/@version/react-v15
  const actualPkg = pkgDir.sync(resolveFrom(versionedRoot, name))
  // actualPkg = app/node_modules/@version/react-v15/node_modules/react
  return actualPkg
}

//function resolveTopLevelDep(name, versionedName) {
//  return pkgDir.sync(require.resolve(versionedName))
//}
