import untildify from 'untildify'
import path, {join} from 'path'
import _ from 'lodash'
import {spawn, exec} from 'promisify-child-process'

// Great article on bash/zsh init script loading order.
// From: https://shreevatsa.wordpress.com/2008/03/30/zshbash-startup-files-loading-order-bashrc-zshrc-etc/
//
//  For bash, put stuff in ~/.bashrc, and make ~/.bash_profile source it.
//  For zsh, put stuff in ~/.zshrc, which is always executed.
//

// Inspired by: https://github.com/jessetane/shell-source
// We don't use `process.env` because this can contain env vars passed in when running the command.
export default async function getShellEnvVars() {
  // NOTE: Exec will not have any env vars set.
  //const envStdOut = (await exec('env', {shell: true, env: {}})).stdout
  // --

  // TODO(vjpr): See https://github.com/kimmobrunfeldt/spawn-default-shell.
  //   Better shell detection.

  let fileToSource
  // TODO(vjpr): SHELL doesn't exist on Docker alpine.
  //   We need to make this more robust. We should use bash when its around.
  let shellCmd = process.env.SHELL || '/bin/sh'
  if (process.env.SHELL === '/bin/zsh') {
    //console.log('Using shell:', shellCmd)
    fileToSource = untildify('~/.zshrc')
  } else {
    fileToSource = untildify('./bash_profile')
    //fileToSource = '/etc/profile'
  }
  let out
  try {
    // TODO(vjpr): See https://github.com/kimmobrunfeldt/spawn-default-shell.

    const shellFlags = [
      // NOTE: Adding `-i` prevents from exiting.
      //'-i',
      '-l', // Makes login shell which sets HOME and USER I think.
      '-c',
    ]

    //const script = join(__dirname, 'source.sh')
    //const spawnArgs = [...shellFlags, script, fileToSource]

    let sourceCmd
    if (require('fs').existsSync(fileToSource)) {
      sourceCmd = `source ${fileToSource}; printenv`
    } else {
      sourceCmd = `printenv`
    }
    const spawnArgs = [...shellFlags, sourceCmd]
    //console.log({spawnArgs})

    out = await spawn(shellCmd, spawnArgs, {
      // Default to `process.env` I think, so we need to clear it.
      env: {},
      //shell: '/bin/zsh', // We take care of this manually.
      encoding: 'utf8',
    })
  } catch (e) {
    console.log(e) // DEBUG
    console.log(e.stderr?.toString())
    throw e
  }
  //console.log(out) // DEBUG
  const envStdOut = out.stdout?.toString()
  //console.log('Spawn output:', envStdOut.split('\n'))
  let env = parseEnvStr(envStdOut)

  return env
}

// E.g. `FOO=1\nBAR=1` to `{FOO: 1, BAR: 1}`.
// Be careful, the value could have an `=` char in it.
function parseEnvStr(env) {
  // Only split on first instance of `=`.
  // From: https://stackoverflow.com/a/4607799/130910
  return _.fromPairs(env.split('\n').map(line => line.split(/=(.+)/)))
}

////////////////////////////////////////////////////////////////////////////////

