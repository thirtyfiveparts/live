import index from './index'
import yargs from 'yargs'

export async function cli() {

  const [pkgName] = process.argv.slice(2)
  await index({pkgName})

}
