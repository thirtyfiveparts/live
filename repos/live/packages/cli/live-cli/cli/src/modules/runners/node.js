import _ from 'lodash'
import dargs from 'dargs'
import path, {join} from 'path'
import {parseArgs} from '@src/modules/parse-args'

// Runs a node script.
export default function makeNode({run, repoRoot, projectRoot, config}) {
  const parsedArgs = parseArgs(process.argv)

  // TODO(vjpr): Don't print colors to logs if using `--inspect`.
  //   Or change colors to browser colors.

  // TODO(vjpr):
  //   debugBrk = --inspect-brk
  //   debug = --inspect
  return async function(scriptPath, {env, opts, inspect, inspectBrk}) {
    const customEnv = env || {}
    let customEnvStr = _(customEnv)
      .map((v, k) => `${k}=${v}`)
      .join(' ')
    opts = opts || {}

    // NOTE: Can include port number.
    // Allow inspect to be parsed in from livefile, or take from argv.
    const nodeArgs = dargs({
      inspect: inspect ?? parsedArgs.inspect,
      inspectBrk: inspectBrk ?? parsedArgs.inspectBrk,
    }).join(' ')

    const scriptArgs = dargs(opts).join(' ')

    const cmd = `node ${nodeArgs} ` + scriptPath + ' ' + scriptArgs

    const cmdStrWithEnv = [customEnvStr, cmd].join(' ')

    // TODO(vjpr): Spacing.
    //console.log(`Running:`, cmdStrWithEnv)

    const finalEnv = {
      //...process.env, // `envPrependProcessEnv` does this below.
      LIVE_CLI_PROJECT_ROOT: projectRoot,
      LIVE_CLI_REPO_ROOT: repoRoot,
      ...customEnv,
    }

    //const cmd = 'npm run dev'
    run(cmd, {
      cwd: repoRoot,
      envPrependProcessEnv: true,
      env: finalEnv,
    }, config)
  }
}
