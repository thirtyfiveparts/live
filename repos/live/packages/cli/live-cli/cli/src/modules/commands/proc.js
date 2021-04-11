import {processManager} from '../process-manager'
import psList from 'ps-list'

// `live ps`
export async function handleCommand() {
  console.log('hi')

  await processManager.init()

  //const osProcesses = await psList()
  //const ps = processManager.getProcesses()
  //for (const [pid, info] of Object.entries(ps)) {
  //  console.log(pid)
  //}

  await processManager.sync()

  processManager.printProcesses()

}
