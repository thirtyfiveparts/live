import Yargs from 'yargs'
import {prompt} from 'enquirer'
import index from './index'

export async function cli() {

  console.log('Hello, world!!')
  await index()

}
