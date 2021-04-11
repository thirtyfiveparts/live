import {spawn, exec} from 'promisify-child-process'
import dargs from 'dargs'
import Debug from 'debug'
import c from 'chalk'
import isUndefined from 'is-undefined'
import fs from 'fs'
import path, {join} from 'path'
import {serializePkgName} from '@src/modules/shared'

const debug = Debug('docker-js-cli')

function makeCmdStr({file, tag, context}) {
  const cmd = 'docker build'
  file = file || '-' // read from stdin
  const args = dargs(
    {
      //help: true,
      file,
      tag, // NOTE: --tag accepts NAME:TAG. Yes, its confusing.
    },
    {aliases: {file: 'f', tag: 't'}},
  )
  const cmdStr = `${cmd} ${args.join(' ')} ${context}`
  return cmdStr
}

function manualCmdStr() {}

export class Docker {
  constructor(dockerfile) {
    this.dockerfile = dockerfile
  }

  async build({context, tag, dryRun}) {
    context = isUndefined(context) ? '.' : context
    dryRun = isUndefined(dryRun) ? false : dryRun
    const cwd = process.cwd()
    const dockerfileStr = this.dockerfile.render()
    //const context = 'archive' // DEBUG

    const cmdStr = makeCmdStr({tag, context})

    function makeManualCmdStr() {
      const tmpDockerfilePath = join(
        cwd,
        `tmp/Dockerfile.${serializePkgName(tag)}.Dockerfile`,
      )
      fs.writeFileSync(tmpDockerfilePath, dockerfileStr)
      const tmpDockerfilePathRel = path.relative(cwd, tmpDockerfilePath)
      return makeCmdStr({file: tmpDockerfilePathRel, tag, context})
    }

    // Also writes dockerfile to disk for debugging.
    const manualCmdStr = makeManualCmdStr()

    // TODO(vjpr): Maybe we should write the dockerfile to memory and show the exact command the user can run?
    console.log('Running:', cmdStr + c.grey(` (dockerfile written to stdin)`))
    console.log(c.grey('  To run manually: ' + manualCmdStr))

    if (dryRun) return
    const child = spawn(cmdStr, {
      //encoding: 'utf8',
      shell: true,
      stdio: ['pipe', 'inherit', 'inherit'],
      cwd,
    })
    child.stdin.setEncoding('utf-8')
    //console.log('Writing dockerfile docker child process stdin:', dockerfileStr)
    child.stdin.write(dockerfileStr + '\n')
    child.stdin.end()
    try {
      await child
    } catch (e) {
      console.log('CAUGHT ERROR', e)
      // TODO(vjpr): Tell user how to inspect docker container.

      const fromImage = '' // TODO(vjpr):
      // Look at base (from) image to see why the build failed.
      const cmd = `docker exec -it ${fromImage} bash`// If there is an error after container is built...

      // Look at the intermediate container.
        // docker ps -a
      const cmd2 = `docker run --rm -it IMAGE bash`

      // https://stackoverflow.com/questions/26220957/how-can-i-inspect-the-file-system-of-a-failed-docker-build
      const IL = '' // TODO(vjpr): How to get last successful layer?
      const cmd3 = `docker run --rm -it ${IL} bash -il`

      // TODO(vjpr): Run up to a step...--target? or is this just for multistage builds.
    }
  }

  run() {}
}

// imageName - name and tag
export async function imageExists(imageName) {
  const cmd = `docker image inspect ${imageName}`
  debug(`Running '${cmd}'`)
  const {stdout, stderr, code} = await exec(cmd, {
    shell: true,
    encoding: 'utf8',
  }).catch(e => e)
  // TODO(vjpr): Test!
  return isUndefined(code)
}

////////////////////////////////////////////////////////////////////////////////
