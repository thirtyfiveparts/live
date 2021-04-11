const out = fs.readdirSync(destDir)

function ignoreNodeModules(stats) {
  return stats.path.indexOf('node_modules') === -1
}
function myFilter(stats) {
  if (stats.isFile() || stats.isSymbolicLink()) {
    const res = micromatch.contains(stats.path, ignore, {dot: true})
    return res
  }
}
const out2 = await rde.async(destDir, {filter: myFilter, deep: ignoreNodeModules})
console.log(out2)
