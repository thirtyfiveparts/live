import run from './run'
import path, {join} from 'path'
import Debug from 'debug'
const debug = Debug('@live/cli:run-exec')

export default async function runExec(cmd, {cwd, repoRoot, projectRoot, config}) {
  // TODO(vjpr): This is not working because we need to run from the repo root for our apps.
  const cmdStr = cmd
  const spawnOpts = {
    cwd,
    //cwd: projectRoot,
    env: process.env,
    // inherit for stdin. Didn't want to add to run because it may break other things like the interactive mode perhaps.
    stdio: ['inherit', 'pipe', 'pipe'],
  }

  // Prepend node modules bin dirs to PATH.
  const projectNodeModulesBin = join(projectRoot, 'node_modules/.bin')
  const repoNodeModulesBin = join(repoRoot, 'node_modules/.bin')
  prependToEnvPath(spawnOpts.env, [projectNodeModulesBin, repoNodeModulesBin])

  debug('Running: ' + cmdStr + ' (cwd: ' + projectRoot + ')')

  const info = {runType: 'exec', projectRoot}
  await run(cmdStr, spawnOpts, config, {info})
}

function prependToEnvPath(env, ps) {
  // TODO(vjpr): _.castArray(ps)
  env.PATH = [...ps, env.PATH || ''].join(':')
}
