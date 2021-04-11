import {daemonize} from '../daemon'
import createServer from '../daemon/create-server'
import {configSystem} from '../config-system'
import {ModuleRpcProtocolClient} from 'rpc_ts/lib/protocol/client'
import {NodeHttpTransport} from '@improbable-eng/grpc-web-node-http-transport'
import isPortReachable from 'is-port-reachable'
import {Tail} from 'tail'

/**
 * Run a daemon.
 */
export default async function ({pargv, config, cwd, repoRoot}) {
  console.log('Run daemon!')

  const commands = {
    // This is the command that is run that actually starts the daemon.
    async startInternal() {
      console.log('Starting daemon (internal)')
      const {running} = await isDaemonRunning()
      if (running) return
      await createServer()
    },
    // Starts a daemon in another process if it is not already running.
    async start() {
      await startServer()
    },
    async status() {
      console.log('Status')
      const status = await getServerStatus()
      console.log({status})
    },
    async stop() {
      console.log('Stop')
      await stopServer()
    },
    async restart() {
      console.log('Restart')
      await restartServer()
    },
    async attach() {
      console.log('Attach')
      const {logFile} = getLogPaths()
      //const stat = fs.statSync(logFile)
      // TODO(vjpr): Maybe we should use `always-tail` as it can survive rollovers etc.
      const tail = new Tail(logFile)
      tail.on('line', data => console.log(data))
      tail.on('error', function (error) {
        console.log('ERROR: ', error)
      })
      //const logStream = fs.createReadStream(logFile, {start: stat.size})
      //logStream.pipe(process.stdout)
    },
  }

  const firstArg = pargv[0]

  let cmd
  if (!firstArg) {
    cmd = commands.start
  } else {
    cmd = commands[firstArg]
  }

  if (!cmd) {
    // TODO(vjpr): Show help.
    return
  }

  await cmd()
}

function areWeTheDaemon() {
  return Boolean(process.env.LIVE_IS_DAEMON)
}

async function isDaemonRunning() {
  // Send an rpc message to it!
  const port = configSystem.get('port')

  // TODO(vjpr): Could also compare pid+lstart with this entry.
  const pid = configSystem.get('pid')

  const running = await isPortReachable(port, {host: 'localhost'})

  return {running, port, pid}
}

////////////////////////////////////////////////////////////////////////////////

async function startServer() {
  const {running, port, pid} = await isDaemonRunning()
  if (running) {
    console.log(
      `Daemon is already running on port=${port} and it is reacheable`,
    )
    return
  }
  if (areWeTheDaemon()) {
    // This should almost never happen.
    console.warn('We are the daemon.')
    return
  }
  await daemonize()
}

////////////////////////////////////////////////////////////////////////////////

async function getClient() {
  const port = configSystem.get('port')
  if (!port) {
    console.error(`Port cannot be found in ${configSystem.path}`)
  }
  const client = await ModuleRpcProtocolClient.getRpcClient(helloService, {
    remoteAddress: `http://localhost:${port}`,
    getGrpcWebTransport: NodeHttpTransport(),
  })
  return client
}

async function getServerStatus() {
  const {running, port, pid} = await isDaemonRunning()

  if (!running) {
    console.log(`It's not running`)
    return
  }

  const client = await getClient()
  const {text} = await client.getHello({language: 'Spanish'})
  return {running, port, pid, status: text}
}

////////////////////////////////////////////////////////////////////////////////

import to from 'await-to'
import * as fs from 'fs'
import {getLogPaths} from '@src/modules/daemon/logging'

const helloService = {
  getHello: {
    request: {} as {language: string},
    response: {} as {text: string},
  },
}

import pidtree from 'pidtree'


async function stopServer() {
  const fkill = require('fkill')
  const {running, port, pid} = await isDaemonRunning()
  if (!running) {
    console.log(`It's not running`)
    return
  }
  console.log(`Killing pid tree ${pid}`)

  const pids = await pidtree(pid)

  //const [err, res] = await to(fkill(pid))
  //if (err) {
  //  throw err
  //}

  // Wait for process to die.

  //console.log('Killed successful.', res)
}

async function restartServer() {
  await stopServer()
  await startServer()
}

async function waitUntilProcessDead() {



}
