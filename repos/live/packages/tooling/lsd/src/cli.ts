import Yargs from 'yargs'
import {prompt} from 'enquirer'
import index from './index'
const { hideBin } = require('yargs/helpers')

export async function cli() {

  const argv = Yargs(hideBin(process.argv)).option('create-readmes').argv

  console.log('Hello, world!!', argv)
  await index()

}
