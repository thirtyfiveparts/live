import glob from 'globby'
import fse from 'fs-extra'
import path, {join} from 'path'

export default async function () {
  withGlob()
}

function withGlob() {
  const cwd = findRepoRoot()
  const files = glob.sync('**/package.json', {
    cwd,
    ignore: ['**/node_modules/**', '.dev'],
  })

  const names = {}
  for (const p of files) {
    const pjson = fse.readJsonSync(join(cwd, p))
    names[pjson.name] = names[pjson.name] ?? []
    names[pjson.name].push({path: p, manifest: pjson})
  }

  const dupes = Object.entries(names).filter(([name, val]) => {
    return val.length > 1
  })

  dupes.map(([name, vals]) => {
    console.log(name)
    console.log(vals.map(v => [v.path, v.manifest.name]))
  })

  function findRepoRoot() {
    const findUp = require('find-up')
    const path = require('path')
    const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
    return path.dirname(rootPath)
    //return process.cwd()
    if (!rootPath) {
      throw `Couldn't find root path`
    }
  }
}
