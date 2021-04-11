// TODO(vjpr): DELETE THIS EVENTUALLY. Replaced by docker-js-cli.

import dargs from 'dargs'
import {spawn} from 'promisify-child-process'
import {getDestForPkgName} from '@src/modules/shared'
import getImageNameFromPkg from '@src/modules/image-name-from-pkg'

export async function dockerBuild(pkgName, opts, argv) {

  const {dockerImagePrefix} = opts

  if (!pkgName) throw 'No pkg name provided!!!'

  const repoRoot = process.cwd()

  // The root docker context.
  //const serPkgName = serializePkgName(pkgName)
  const cwd = getDestForPkgName(repoRoot, pkgName)
  const pkgNameRoot = await getPkgNameRoot(pkgName)
  const dockerfile = join(pkgNameRoot, 'Dockerfile')
  console.log({cwd, pkgNameRoot, dockerfile})

  // NOTE: Cannot contain `@`, and cannot start with `-` AFAICT.
  const imageName = getImageNameFromPkg(pkgName, {dockerImagePrefix})

  // E.g. `.deps`. For building images up to a certain stages `foo/bar.deps`.
  const imageSuffix = ''

  const imageTag = 'latest' // NOTE: --tag accepts NAME:TAG. Yes, its confusing.
  const cmd = 'docker build'
  const argStr = dargs(
    {
      //help: true,
      file: dockerfile,
      tag: imageName + imageSuffix + ':' + imageTag,
    },
    {aliases: {file: 'f'}},
  )
  const contextRoot = '.' // cwd
  const cmdStr = cmd + ' ' + argStr.join(' ') + ' ' + contextRoot
  console.log('Running:', cmdStr)

  ////////////////////

  const res = await spawn(cmdStr, {
    //encoding: 'utf8',
    shell: true,
    stdio: 'inherit',
    cwd,
  })

  //const {stdout, stderr, code} = res
  //console.log(stdout, stderr, code)
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Don't call pnpm it will be slow.
async function getPkgNameRoot(pkgName) {
  const res = await runCmd(
    `pnpm m ls --porcelain --depth=-1 --filter=${pkgName}`,
  )
  return res[0]
}
