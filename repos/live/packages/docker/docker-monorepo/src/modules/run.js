import {spawn, exec} from 'promisify-child-process'
import getImageNameFromPkg from '@src/modules/image-name-from-pkg'

export default async function(pkgName, opts, argv) {
  const {dockerImagePrefix} = opts

  const cwd = process.cwd()

  const imageName = getImageNameFromPkg(pkgName, {dockerImagePrefix})
  const cmdStr = `docker run --rm -it ${imageName}`
  const res = await spawn(cmdStr, {
    //encoding: 'utf8',
    shell: true,
    stdio: 'inherit',
    cwd,
  })

}
