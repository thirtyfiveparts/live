import run from './run'
import Debug from 'debug'
const debug = Debug('@live/cli:npm-script')

export default async function runNpmScript(
  runScript,
  args,
  {repoRoot, projectRoot, config},
) {
  // TODO(vjpr): This is not working because we need to run from the repo root for our apps.
  const cmdStr = 'npm run ' + runScript + (args ? ' ' + args : '')
  const spawnOpts = {cwd: projectRoot, env: process.env}
  debug('Running: ' + cmdStr + ' (cwd: ' + projectRoot + ')')

  const info = {runType: 'npm-script', projectRoot}
  await run(cmdStr, spawnOpts, config, {info})
}

////////////////////////////////////////////////////////////////////////////////

//async function spawn({cmd, args}) {
//  var spawn = require('child-process-promise').spawn
//
//  var promise = spawn(cmd, args)
//
//  var childProcess = promise.childProcess
//
//  console.log('[spawn] childProcess.pid: ', childProcess.pid)
//  childProcess.stdout.on('data', function(data) {
//    console.log('[spawn] stdout: ', data.toString())
//  })
//  childProcess.stderr.on('data', function(data) {
//    console.log('[spawn] stderr: ', data.toString())
//  })
//
//  promise
//    .then(function() {
//      console.log('[spawn] done!')
//    })
//    .catch(function(err) {
//      console.error('[spawn] ERROR: ', err)
//    })
//}
