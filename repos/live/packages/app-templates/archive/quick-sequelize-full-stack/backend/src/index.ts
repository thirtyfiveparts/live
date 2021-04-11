import Yargs from 'yargs'
import {prompt} from 'enquirer'
import main from './main'

export async function cli() {
  const repoRoot = process.cwd()
  console.log('hello world!')
  await run()
}

export default async function run() {
  await main()
}
