import {configSystem} from '../config-system'
import express from 'express'
import http from 'http'
import {serverServiceDefinition} from '../server/protocol'
import {ModuleRpcServer} from 'rpc_ts/lib/server'
import {ModuleRpcCommon} from 'rpc_ts/lib/common'
import {ModuleRpcProtocolServer} from 'rpc_ts/lib/protocol/server'
import ps from '../process-manager/ps'

export default async function createServer() {
  // Store connection details in config.

  console.log('creating server')

  const port = 50000
  console.log('Reaing config from:', configSystem.path)
  configSystem.set({port})
  configSystem.set({pid: process.pid})
  const procs = await ps()
  const psEntry = procs.find(p => p.pid === process.pid)

  const app = express()
  const handler: ModuleRpcServer.ServiceHandlerFor<
    typeof serverServiceDefinition
  > = {
    async getHello({language}) {
      if (language === 'Spanish') return {text: 'Hola'}
      throw new ModuleRpcServer.ServerRpcError(
        ModuleRpcCommon.RpcErrorType.notFound,
        `language '${language}' not found`,
      )
    },
  }
  app.use(
    ModuleRpcProtocolServer.registerRpcRoutes(serverServiceDefinition, handler),
  )
  http.createServer(app).listen(port)

}
