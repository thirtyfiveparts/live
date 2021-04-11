import {spawn, exec} from 'promisify-child-process'

export default async function(pkgName, argv) {

  const cwd = process.cwd()

  //const imageName = getImageNameFromPkg(pkgName)
  const cmdStr = `docker-compose -f docker-compose.yml up`
  const res = await spawn(cmdStr, {
    //encoding: 'utf8',
    shell: true,
    stdio: 'inherit',
    cwd,
  })

}
