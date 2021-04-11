import yargsParser from 'yargs-parser'
import path, {join} from 'path'
import fs from 'fs'
import _ from 'lodash'
import Dockerfile from './index'

export default async function() {
  const cwd = process.cwd()
  const yargsOpts = {
    alias: {
      outFile: ['o'],
      forceTTY: ['t'],
    },
    boolean: ['force-tty'],
  }
  const args = yargsParser(process.argv.slice(2), yargsOpts)

  // TODO(vjpr): Its not a TTY if we are piping its output - e.g. if we are running it as a cli.
  const isTTY = args.forceTTY ?? Boolean(process.stdout.isTTY)

  let inFile = args._[0]
  if (!inFile) inFile = 'Dockerfile.js'
  if (!fs.existsSync(inFile)) {
    if (!isTTY) return process.exit(1)
    return console.error(`${inFile} does not exist`)
  }

  inFile = path.isAbsolute(inFile) ? inFile : join(cwd, inFile)

  const outFile = inFile + '.generated'
  const module = require(inFile)
  const dockerfile = await runDefault(module, Dockerfile)
  const dockerfileContents = dockerfile.render()

  if (!isTTY) {
    process.stdout.write(dockerfileContents)
    return process.exit(0)
  }
  if (args.outFile) {
    fs.writeFileSync(args.outFile, dockerfileContents)
    return
  } else {
    console.log(dockerfileContents)
  }
}

////////////////////////////////////////////////////////////////////////////////

async function runDefault(module, Dockerfile) {
  const res = module.default(Dockerfile)
  return res.then ? await res : res

  //if (_.isString(module)) {
  //  return module
  //} else if (_.isFunction(module)) {
  //  return module()
  //} else if (module.then) {
  //  return await module
  //} else if (module.default) {
  //  const a = module.default.then
  //  console.log(a)
  //}
}
