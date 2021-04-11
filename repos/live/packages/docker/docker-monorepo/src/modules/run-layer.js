import {spawn, exec} from 'promisify-child-process'

export default async function(layer, argv) {
  const cwd = process.cwd()

  const cmdStr = `docker run --rm -it ${layer} bash -il`
  const res = await spawn(cmdStr, {
    //encoding: 'utf8',
    shell: true,
    stdio: 'inherit',
    cwd,
  })
}
