import findUp from 'find-up'
import {spawn} from 'child_process'
import path from 'path'
import {configSystem} from '../config-system'
import {getLogPaths, setupLogging} from '@src/modules/daemon/logging'

export async function daemonize() {
  const repoRoot = await findRepoRoot()

  const {outStream, errStream} = setupLogging()

  const stdio = ['inherit', outStream, errStream]
  //const stdio = ['inherit', 'inherit', 'inherit'] // DEBUG

  let spawnArgs = {
    stdio,
    cwd: repoRoot,
    detached: true,
    env: {...process.env, LIVE_IS_DAEMON: 1},
  }
  const args = ['daemon', 'startInternal']
  const child = spawn(require.main.filename, args, spawnArgs)
  console.log('child.pid:', child.pid)

  const logPaths = getLogPaths()
  configSystem.set(logPaths)

  child.unref()
}

////////////////////////////////////////////////////////////////////////////////

async function findRepoRoot() {
  //return process.cwd()
  const rootMarkerFile = await findUp('pnpm-workspace.yaml')
  if (!rootMarkerFile) return process.cwd()
  return path.dirname(rootMarkerFile)
}

////////////////////////////////////////////////////////////////////////////////

