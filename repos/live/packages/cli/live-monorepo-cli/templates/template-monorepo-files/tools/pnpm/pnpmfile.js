module.exports = {
  hooks: {readPackage, afterAllResolved},
}

function afterAllResolved(lockfile, context) {
  return lockfile
}
function readPackage(pkg, ctx) {
  return pkg
}
