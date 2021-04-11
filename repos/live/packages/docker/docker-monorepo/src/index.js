import parse from 'yargs-parser'
import sync from '@src/modules/commands/sync'
import {dockerBuild} from '@src/modules/docker-build'
import run from '@src/modules/run'
import up from '@src/modules/up'
import make from '@src/modules/make'
import runLayer from '@src/modules/run-layer'
import defaultDocker from '@src/modules/default'
import {spath} from '@live/log-style'
import c from 'chalk'
import path, {join} from 'path'
import Dockerfile, {Docker} from 'dockerfile-js'

export default async function () {
  await cli()
}

////////////////////////////////////////////////////////////////////////////////

export async function cli() {
  let args
  if (!args) args = process.argv.slice(2)
  const bin = 'docker-monorepo'
  const argv = parse(args)

  // TODO(vjpr): Allow help per command.
  if (argv.help) {
    showGlobalHelp()
    return
  }

  const cmd = argv._[0]

  if (!cmd) return showGlobalHelp()

  console.log(cmd)

  // TODO(vjpr): Handle non-existent.
  const config = require(join(process.cwd(), 'live.docker.config.js'))

  const dockerImagePrefix = config.registry + '/'

  switch (cmd) {
    case 'build-service': {
      // DEBUG
      const pkgName = argv._[1]
      const registry = config.registry
      // --

      await defaultDocker({pkg: pkgName, registry}, argv)
      break
    }
    case 'print-docker-file': {
      const pkgName = argv._[1]
      await make()
      break
    }
    // Copies files to .docker-trees/.
    case 'sync': {
      const pkgName = argv._[1]
      await sync(pkgName, argv)
      break
    }
    case 'build': {
      const pkgName = argv._[1]
      //const opts = {target: 'dependencies'}
      const opts = {dockerImagePrefix}
      await dockerBuild(pkgName, opts, argv)
      break
    }
    case 'run': {
      const pkgName = argv._[1]
      const opts = {dockerImagePrefix}
      await run(pkgName, opts, argv)
      break
    }
    case 'run-layer': {
      // If a build fails, you can run a container from an intermediary image layer.
      const layer = argv._[1] // E.g. 83f0e66c54a2
      await runLayer(layer, argv)
      break
    }
    case 'exec': {
      const serviceName = 'app'
      const test = `docker-compose exec ${serviceName} bash` // TODO(vjpr):
      break
    }
    // Docker compose.
    case 'up': {
      const pkgName = argv._[1]
      await up(pkgName, argv)
      break
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function desc(...args) {
  return c.grey(...args)
}

function cmd(...args) {
  return c.bold(...args)
}

function opt(name, desc) {
  return '  ' + name + ' ' + c.grey(desc)
}

function showGlobalHelp() {
  let str = ''

  const nl = () => (str += '\n')
  const sp = () => (str += ' ')
  const line = s => (str += s)

  str += 'docker-monorepo'
  str += '> Used for running docker commands on the monorepo'
  nl()
  nl()
  str += cmd('sync <app|service> ')
  str += desc(
    `Copies a filtered tree containing only workspace deps of the service to '.docker-trees/<pkg-name>'`,
  )
  nl()
  str += opt(
    '--only-pjsons',
    `Only the files required to run 'pnpm i'. Tree is created in '.docker-trees/<pkg-name>/tmp-pjson-tree' (needs to be in Docker cwd context)`,
  )
  nl()
  nl()
  str += cmd('build <app|service> ')
  str += desc('Builds a Docker image for an app')
  nl()
  console.log(str)
}
