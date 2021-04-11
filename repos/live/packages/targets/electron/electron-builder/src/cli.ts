import Yargs from 'yargs'
import {prompt} from 'enquirer'
import index from './index'
import build from './commands/build'
import {default as _package} from './commands/package'
import readPkg from 'read-pkg'

export async function cli() {

  const cwd = process.cwd()
  const pjson = readPkg.sync({cwd})

  const yargs = Yargs(process.argv.slice(2))
  const argv = yargs
    .command(
      'build',
      'build',
      () => {},
      async argv => {
        await build()
      },
    )
    .command(
      'package',
      'package',
      () => {},
      async argv => {
        await _package()
      },
    ).argv

  //console.log('Hello, world!!')
  //await index()
}
