import parsePackageJsonName from 'parse-packagejson-name'

// We use our Docker namespace and remove our npm scope from package name.
//
// E.g. @foo/bar.baz -> foo-docker/bar.baz
// TODO(vjpr): Should we use dots?
export default function getImageNameFromPkg(pkgName, {dockerImagePrefix} = {}) {
  // Old approach.
  //const serPkgName = serializePkgName(pkgName)
  //const imageName = serPkgName.replace('@', 'at-')
  // --

  dockerImagePrefix = dockerImagePrefix ?? ''

  // TODO(vjpr): Should we use module name -> https://github.com/keithamus/parse-packagejson-name#parsepackagejsonname
  const pkg = parsePackageJsonName(pkgName)

  // E.g dockerImagePrefix = `foo/pro-`
  const imageName = dockerImagePrefix + pkg.fullName
  return imageName
}
