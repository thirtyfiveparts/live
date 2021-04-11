import Yargs from 'yargs'
import {prompt} from 'enquirer'
import index from './index'
import {hideBin} from 'yargs/helpers'
import {promisify} from 'util'
import to from 'await-to'
import runWebpack from '@src/modules/webpack'

export async function cli() {
  console.log('Live React App')

  const dev = {
    command: ['dev', '*'],
    describe: '',
    builder: {},
    async handler(argv) {
      await runWebpack()
    },
  }
  const build = {
    command: 'build',
    describe: '',
    builder: {},
    handler(argv) {
      console.log('build')
    },
  }

  const yargs = Yargs.command(dev).command(build).help().argv

  //await index()
}

