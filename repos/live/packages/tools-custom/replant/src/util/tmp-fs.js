import {flatten} from 'flat'
import tmp from 'tmp'
import os from 'os'
import fse from 'fs-extra'
import _ from 'lodash'
import {join} from 'path'
import userHome from 'user-home'

const tmpFsRoot = join(userHome, '.npm-module-tmp', 'replant', 'tests')

let rootDir = tmpFsRoot

export default function mock(tree, {root} = {}) {

  rootDir = join(tmpFsRoot, path.normalize(root || '/cwd'))
  //console.log('Using root dir:', rootDir)
  fse.emptyDirSync(rootDir) // TODO(vjpr): Be very careful here!
  const files = flatten(tree, {delimiter: '/'})
  _(files).map((v, k) => {
    fse.outputFileSync(join(rootDir, k), v)
  }).value()
  return rootDir

}

mock.restore = () => {
  fse.emptyDirSync(rootDir) // TODO(vjpr): Be very careful here!
}
