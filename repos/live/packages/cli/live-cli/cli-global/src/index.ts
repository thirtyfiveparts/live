import 'hard-rejection/register'
import path, {join} from 'path'
import {existsSync} from 'fs'
import childProcess, {execSync, spawnSync, spawn} from 'child_process'
import findUp from 'find-up'
import Debug from 'debug'
const {promisify} = require('util')

const debug = Debug('index')

export default async function ({binName}) {
  // This allows us to run the es5 version or the babel/register version.
  binName = binName || 'live'

  // This command could be run from anywhere in the monorepo.
  // `@live/cli` should only need to be installed in the root.
  // So we must find the root.

  const repoRoot = await findRepoRoot()

  const liveLocalBinPath = await getLocalBinPath({binName, repoRoot})

  console.log(`Found: ${liveLocalBinPath}`)
  checkBinExists(liveLocalBinPath)

  let args = process.argv

  // TODO(vjpr): This didn't work. Why?
  // I think because splice work in-place and this is immutable.
  //let args = process.argv.splice(0, 2)

  // Removes [`path/to/node`, `path/to/script.js`].
  args.splice(0, 2)

  const firstArg = args[0]

  const cwd = process.cwd()
  //const cwd = repoRoot // Used to be this.

  let spawnArgs = {stdio: 'inherit', cwd, detached: false}

  // We use `spawn` not `spawnSync` to make our timing work in `bin`.
  const child = spawn(liveLocalBinPath, args, spawnArgs)

  // DEBUG
  //await debugPrintPsTree(child)

}

async function debugPrintPsTree(child) {
  console.log({childPid: child.pid, processPid: process.pid})
  const execAsync = promisify(childProcess.exec)
  const out = await execAsync(`pstree ${process.pid}`)
  console.log(out.stdout)
}

async function getLocalBinPath({binName, repoRoot}) {
  // Its faster to avoid execa.
  //const execa = require('execa')
  //const {stdout: npmBinDir} = await execa('npm' , ['bin'], {cwd: repoRoot})
  const npmBinDir = join(repoRoot, 'node_modules/.bin')
  const liveLocalBinPath = join(npmBinDir, binName)
  return liveLocalBinPath
}

function checkBinExists(liveLocalBinPath) {
  const exists = existsSync(liveLocalBinPath)
  if (!exists) {
    console.error(
      `Could not find locally installed 'live'. Please run 'pnpm install @live/cli'`,
    )
    process.exit(1)
  }
}

async function findRepoRoot() {
  //return process.cwd()
  const rootMarkerFile = await findUp('pnpm-workspace.yaml')
  if (!rootMarkerFile) return process.cwd()
  return path.dirname(rootMarkerFile)
}
