import Dockerfile from 'dockerfile-js'
import dargs from 'dargs'
import {Docker, imageExists} from '@src/modules/docker-js-cli'
import getImageNameFromPkg from '@src/modules/image-name-from-pkg'
import {getPkgJsonFromPkgName, getPkgGraph} from '@src/modules/shared'
import sync from '@src/modules/commands/sync'
import isUndefined from 'is-undefined'
import c from 'chalk'
import path, {join} from 'path'
import {getDestForPkgName} from '@src/modules/shared'

// TODO(vjpr): Put dockerfile js definitions in separate files so we can print a file path so user can click from iterm.

function printStep(str) {
  console.log(c.bold.green(str))
}

export default async function({pkg, registry}, argv) {
  const repoRoot = process.cwd()
  const workspacePrefix = process.cwd() // TODO(vjpr)
  const pkgGraph = await getPkgGraph(workspacePrefix)
  const pjson = await getPkgJsonFromPkgName(pkg, pkgGraph)
  const projectConf = pjson['live-docker'] || {
    product: pjson.name,
    service: pjson.name,
  }
  const {product, service} = projectConf

  const {sharedDeps, skipSync} = argv

  const useSharedMonorepoDepsImage = sharedDeps

  //const dockerImagePrefix = `${registry}/${product}-`
  //const imageName = dockerImagePrefix + service
  //const imageName = getImageNameFromPkg(pkg, {dockerImagePrefix})

  const imageName = `${registry}/${product}.${service}`
  const depsImageFullName = imageName + `.deps`
  const serviceImageName = imageName

  console.log(c.bold.underline(`Preparing image '${imageName}'`))

  // Docker context dir.
  const context = getDestForPkgName(repoRoot, pkg)

  // # Sync

  printStep('Sync')

  // cli args
  ////////////////////

  let {dryRun, shouldPrint, buildDepsFromScratch, updateDepsImage} = argv
  shouldPrint = isUndefined(shouldPrint) ? true : shouldPrint
  buildDepsFromScratch = isUndefined(buildDepsFromScratch)
    ? false
    : buildDepsFromScratch
  updateDepsImage = isUndefined(updateDepsImage) ? false : updateDepsImage

  ////////////////////

  // Sync
  ////////////////////

  const pjsonDir = 'tmp-pjson-tree/'

  if (useSharedMonorepoDepsImage) {
    // No tree shaking for deps image. All deps will be installed.
    // TODO(vjpr): We can just use the current working dir as context then...
  } else {
    // Tree shaking - only deps of our service.
    if (!skipSync) {
      await sync(pkg, {dryRun, shouldPrint: false})
    } else {
      console.log('Skipping sync phase')
    }
  }

  // Build images
  ////////////////////

  printStep('Ensure initial deps image exists')

  const depsImageExists = await imageExists(depsImageFullName)

  const shouldBuildDepsFromScratch = buildDepsFromScratch || !depsImageExists

  if (shouldBuildDepsFromScratch) {
    if (buildDepsFromScratch) {
      console.log(
        `--build-deps-from-scratch flag passed. Building deps image from scratch.`,
      )
    } else if (!depsImageExists) {
      console.log(
        `Initial deps image doesn't exist. Building deps image from scratch.`,
      )
    }
    await buildDeps(
      {pjsonDir, depsImageFullName, context},
      {shouldPrint, dryRun},
    )
  }

  if (updateDepsImage) {
    printStep('Build new deps image from previous deps image (--update-deps-image)')
    if (shouldBuildDepsFromScratch) {
      console.warn('You have just built from scratch, this is not needed.')
    } else {
      console.log(
        'Only deps added since last deps image build will need to be installed.',
      )
      await buildDeps(
        {
          pjsonDir,
          depsImageFullName,
          buildFromLastImage: depsImageFullName,
          context,
        },
        {shouldPrint, dryRun},
      )
    }
  }

  printStep('Build release image')
  console.log(
    'Only deps added since last deps image build will need to be installed.',
  )

  if (shouldBuildDepsFromScratch) {
    // TODO(vjpr): If we just rebuilt our deps image, we don't really need to run pnpm install again. Could get a speed-up here.
  }
  await buildService(
    {pkg, serviceImageName, depsImageFullName, context, pjsonDir},
    {shouldPrint, dryRun},
  )
}

//////////////////////////////////////////////////////////////////////////////

// Deps
async function buildDeps(
  {pjsonDir, depsImageFullName, buildFromLastImage, context},
  {shouldPrint, dryRun},
) {
  const depsDockerfile = getDepsDockerfile({pjsonDir, buildFromLastImage})
  if (shouldPrint) printDockerfile(depsDockerfile)
  const docker = new Docker(depsDockerfile)
  await docker.build({context, tag: depsImageFullName, dryRun})
}

// Service
async function buildService(
  {pkg, serviceImageName, depsImageFullName, pjsonDir, context},
  {shouldPrint, dryRun},
) {
  const serviceDockerfile = getServiceDockerfile()
  if (shouldPrint) printDockerfile(serviceDockerfile)
  const docker = new Docker(serviceDockerfile)
  await docker.build({context, tag: serviceImageName, dryRun})

  function getServiceDockerfile() {
    const depsPartialDockerfile = getDepsPartialDockerfile({pjsonDir})
    // TODO(vjpr): Check sync.js from docker-monorepo. This must be same. Maybe use env var.
    // Compile app assets.
    const serviceBuilder = new Dockerfile()
      .from({
        image: depsImageFullName,
      })
      .concat(depsPartialDockerfile)
      .workdir('/app')
      // I think this is an rsync like copy. Doesn't overwrite nested dirs in dest that are not in src.
      .copy({src: '.', dest: '.'})
      // TODO(vjpr): Currently broken - disabled for testing!
      //.run(`node_modules/.bin/live pkg ${pkg} build`)

    const release = new Dockerfile()
      // NOTE: Explicitely calling node rather than 'npm start' allows signal propagation (SIGINT, SIGTERM, etc.)
      // TODO(vjpr): Change `dev` to `prod` once its fixed.
      .cmd(`node_modules/.bin/live pkg ${pkg} dev`)

    const dockerfileService = serviceBuilder.concat(release)
    return dockerfileService
  }
}

//////////////////////////////////////////////////////////////////////////////

function printDockerfile(dockerfile) {
  console.log('Dockerfile built from code at:', path.relative(process.cwd(), __filename))
  console.log('-----')
  console.log(c.grey(dockerfile.render()))
  console.log('-----')
}

function getDepsDockerfile({pjsonDir, buildFromLastImage}) {
  // Toolchain Dockerfile
  ////////////////////

  // OS packages and tools required to build.

  const toolchainPartial = getToolchainPartialDockerfile()
  const toolchain = getToolchainDockerfile({toolchainPartial})

  // Deps Dockerfile
  ////////////////////

  const depsPartial = getDepsPartialDockerfile({pjsonDir})

  if (buildFromLastImage) {
    return new Dockerfile()
      .from({
        image: buildFromLastImage,
      })
      .concat(depsPartial)
  } else {
    return toolchain.concat(depsPartial)
  }
}

function getDepsPartialDockerfile({pjsonDir}) {
  return (
    new Dockerfile()
      .comment(
        `'${pjsonDir}' contains only 'package.json' files for all workspace projects`,
      )
      // It is still useful to run install with only pjsons/sws because when you are trying to debug the build/run it allows a speedup as long as you don't install new deps (which is common).
      .copy({src: pjsonDir, dest: '.'})
      .run('pnpm install --quiet')
  )
}

function getToolchainDockerfile({toolchainPartial}) {
  return new Dockerfile()
    .from({
      registry: 'mhart',
      image: 'alpine-node',
      tag: '11',
    })
    .concat(toolchainPartial)
}

function getToolchainPartialDockerfile() {
  const toolDeps = ['git', 'bash', 'openssh']

  // Bcrypt is not prebuilt for musl (Alpine's libc).
  // See https://github.com/kelektiv/node.bcrypt.js/issues/658#issuecomment-430862351
  // TODO(vjpr): Use `bcryptjs` and deprecate this.
  const bcryptDeps = ['python', 'build-base']

  // TODO(vjpr): Find out which packages need these.
  const others = [
    'autoconf',
    'automake',
    'g++',
    'libpng-dev',
    'libtool',
    'make',
    'nasm',
  ]

  const pkgs = [...toolDeps, ...bcryptDeps, ...others]

  return new Dockerfile()
    .workdir('/app')
    .apkAdd({
      noCache: '',
      virtual: 'build-deps',
      pkgs,
    })
    .run('npm config set python /usr/bin/python')
    .env({NPM_CONFIG_LOGLEVEL: 'error'})
    .run(
      'npm install pnpm ' +
        dargs({silent: true, global: true, depth: 0}).join(' '),
    )
}

function getDockerImageTag() {
  // TODO(vjpr)
}

////////////////////////////////////////////////////////////////////////////////
