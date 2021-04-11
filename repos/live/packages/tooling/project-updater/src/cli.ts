import Yargs from 'yargs'
import {prompt} from 'enquirer'
import index from './index'
import getPkgDir from 'pkg-dir'

export async function cli() {

  console.log('Hello, world!!')

  const pkgDir = getPkgDir.sync()
  await index({pkgDir})

}
