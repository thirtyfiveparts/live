import fse from 'fs-extra'
import path, {join} from 'path'
import moment from 'moment'
import psList from 'ps-list'
//import psNode from 'ps-node'
import psList2 from './ps'
import ps from 'ps'
//const osProcs2 = await ps({pid: p.pid, fields: ['time']})
import proctree from 'proctree'
import Debug from 'debug'

const debug = Debug('@live') // TODO(vjpr): Namespace.

// See process-list (native bindings), ps-node

import _ from 'lodash'
import netstat from './netstat'
import c from 'chalk'

/**
 Track all processes started by live.
 */
export class ProcessManager {
  registry: any

  constructor(props) {
    const repoRoot = findRepoRoot()
    this.dbPath = join(repoRoot, 'tmp/live-cli-pids.json')
  }

  async init() {
    //fse.writeJsonSync(this.dbPath, []) // DEBUG: Clears process history.
    this.registry = await this.read()
  }

  /**
   * Registers a process.
   *
   * When we start a child process, we call `registerProcess` that adds the process to the registry.
   *
   * The process contains a pid and some info about what command was used to start it.
   *
   * Because pids are recycled by the OS, we must used `pid + startTimestamp` to uniquely identify. NOTE: We keep them stored separately for easier debugging.
   *
   * We can only get the start time from the os via a syscall after the process has started. Node does not expose it to us. That is why we must called `sync`.
   */
  async registerProcess(process, procManInfo) {
    const {pid} = process
    const procInfo = null // Must be set by a separate call to `ps`.
    this.registry.push({pid, procManInfo, procInfo})
    console.log('Adding process:', pid)
    await this.sync()
  }

  async findProcessesByProject(pkgName) {
    const item = _.filter(this.registry, proc => {
      if (proc.status === 'killed') return
      return proc.procManInfo.project.pkgName === pkgName
    })
    return item
  }

  async findProcessByStack(config) {
    const item = _.find(this.registry, proc => {
      const stackName = config.stack?.name
      const instanceName = config.stack?.instanceName
      if (proc.status === 'killed') return
      return (
        proc.procManInfo.stack?.name === stackName &&
        proc.procManInfo.stack?.instanceName === instanceName &&
        proc.procManInfo.project.cmd == config.project.cmd &&
        proc.procManInfo.project.pkgName == config.project.pkgName &&
        proc.procManInfo.project.pkgDir == config.project.pkgDir &&
        proc.procManInfo.project.repoRoot == config.project.repoRoot
      )
    })
    return item
  }

  async read() {
    this.registry = fse.readJsonSync(this.dbPath, {throws: false}) || []
    // TODO(vjpr): Validate registry. Someone could have tampered with the file.
    await this.sync()
    return this.registry || []
  }

  async notifyProcessExited(child, liveProcessId) {
    const item = _.find(this.registry, proc => {
      return (proc.procManInfo.liveProcessId = liveProcessId)
    })
    if (!item) {
      console.warn(
        'Process not found in registry when trying to update its status to killed = true.',
      )
    }
    handleKilled(item, `'notifyProcessExited' functon called`)
    // TODO(vjpr): Does this always run?
    await this.save()
  }

  /**
   * Sync with process state reported by OS.
   *
   * If processes are no longer running, remove them from registry.
   *
   * If they have changed name/cmd, remove them too.
   *
   * NOTE: OS pids are recycled.
   */
  async sync() {
    // "os proc info" basically means what `ps aux` returns.
    //const osProcs = await psList()
    const osProcs2 = await psList2()
    //const nsProcs = await netstat({protocol: 'tcp'})

    for (const p of this.registry) {
      // procManInfo - from live-cli
      // procInfo - from `ps`
      let {pid, procManInfo, procInfo} = p

      if (p.status === 'killed') {
        continue
      }
      // If process is not running anymore.
      // TODO(vjpr): If process has same pid/name/cmd we cannot tell its different.
      const osProc = _(osProcs2).find({pid})
      if (!osProc) {
        // pid doesn't exist - definitely exited.
        handleKilled(p, `pid doesn't exist anymore in os process list`)
        continue
      } else {
        // pid exists - check it is the same process.
        // https://stackoverflow.com/questions/21458095/php-how-can-i-uniquely-identify-a-process-on-linux
        if (!procInfo) {
          // We just created this process, so we store its os proc info.
          p.procInfo = osProc
        } else {
          // procInfo = from registry
          // osProc = from os
          if (!isProcessesStartedAtSameTime(procInfo, osProc)) {
            // Different process, original must be have been killed
            let reason = `Start times for pid=${pid} differ.\n`
            reason += `  Registry entry: ${procInfo.startedStr}\n`
            reason += `  OS process list: ${osProc.startedStr}\n`
            handleKilled(p, reason)
            continue
          } else {
            // Same process!
          }
        }
      }

      ////////////////////

      const procTree = await this.syncProcTree(p.pid)
      //console.log(JSON.stringify(procTree, null, 2))

      require('./lsof/lsof').rawTcpPort(3000, data => {
        console.log(data)
        // TODO(vjpr): Filter by listen.
      })

      //const nsProc = await netstat({pid: p.pid, protocol: 'tcp'})
      //console.log({nsProc})
      //
      //p.ports = p.ports || []
      //p.ports.push(...nsProc)

      //// We need to look for ports open in any proc in the proc tree.
      //addPortsOfChildren(p.procManInfo.childProcs)
      //
      //function addPortsOfChildren(children) {
      //  if (!children) return
      //  children.map((child) => {
      //    console.log(child)
      //    const ports =
      //      _(nsProcs)
      //        .filter({pid: parseInt(child.pid)})
      //        .value() || []
      //    p.ports = p.ports || []
      //    p.ports.push(...ports)
      //    addPortsOfChildren(child.children)
      //  })
      //}

      ////////////////////
    }

    await this.save()
  }

  // Syncs a children of a process so we can get the ports the are listening on.
  async syncProcTree(pid) {
    //childProcs,
    //firstChildProc, // The proc/pid of the process we actually ran.

    ////////////////////

    // Get first child proc. Because we use `shell: true`, `child.pid` will always be the shell (e.g. /bin/zsh).

    // TODO(vjpr): See $NODE_CHANNEL_FD
    //   https://stackoverflow.com/questions/41033716/send-ipc-message-with-sh-bash-to-parent-process-node-js

    debug('shell process pid:', pid)
    // TODO(vjpr): Check out `ps-tree` lib too.
    const tree = proctree.getProcessTree(pid)
    const childProcs = tree.children
    const firstChildProc = tree.children[0]
    debug({firstChildProc})
    return childProcs
    //console.log(JSON.stringify(tree, null, 2))

    // DEBUG: restart after 1 second
    //setTimeout(() => {
    //  process.kill(firstChildProc.pid, 'restart')
    //}, 1000)
    // --

    // TODO(vjpr): Listen for messages from child procs like nodemon.
    //   https://github.com/remy/nodemon/blob/master/doc/events.md#Using_nodemon_as_child_process
    //   We are spawning a shell though so we only get access to the shell.
    //firstChildProc.on('message', event => {
    //  console.log('child message', {event})
    //})

    ////////////////////
  }

  async save() {
    fse.writeJsonSync(this.dbPath, this.registry, {spaces: 2})
  }

  getProcesses() {
    return this.registry
  }

  printStackProcesses() {}

  printProcesses() {
    console.log(
      'Tracked processes (started by live, active or killed within an hour)',
    )
    for (const proc of this.registry) {
      // Only show killed processes less than one hour since they were started.
      const now = moment(new Date())
      const start = moment(proc.foundDeadAt)
      const diffMs = now.diff(start)
      const duration = moment.duration(diffMs)
      if (duration.asHours() >= 1) continue
      // --

      renderProcess(proc)
    }
    console.log('---')
  }
}

function getTimeSinceProcessStarted() {}

function renderProcess(proc) {
  const {pid, procManInfo, procInfo, status, ports} = proc
  let {
    started,
    //cmdStr,
  } = procInfo || {}
  const {
    // config.runInfo
    originalPargv,
    pargv,
    cliFlags,
    completion,
    repoRoot,
    cwd,
    //
    runType,
    projectRoot, // TODO(vjpr): Move to `config.runInfo`.
    //
    cmdStr,
    //
    firstChildProc,
  } = procManInfo
  const fullCmdStr = (originalPargv || []).join(' ')
  const relProjectRoot = path.relative(repoRoot, projectRoot)
  // TODO(vjpr): Maybe group by repoRoot.
  console.log(
    pid,
    firstChildProc?.pid, // First child proc doesn't exist for simple commands.
    'live ' + fullCmdStr,
    c.green(procManInfo.cmdStr),
    renderStatus(status),
    renderPorts(ports),
    started ? moment(started).fromNow() : null,
    c.grey(relProjectRoot),
  )
}

function renderPorts(ports) {
  //{
  //  protocol: 'tcp6',
  //  local: { port: 66, address: '2a02:908:1a7' },
  //  remote: { port: 8, address: '2a03:2880:f01c' },
  //  state: 'ESTABLISHED',
  //  pid: 38108
  //}
  if (!ports) return ''
  if (!ports.length) return ''
  return ports.map(p => c.grey(`${p.protocol}:${p.remote.port}`))
}

function renderStatus(status) {
  if (status === 'killed') return c.red(status)
  return c.green()
}

export const processManager = new ProcessManager()

////////////////////////////////////////////////////////////////////////////////

function handleKilled(p, reason) {
  // DEBUG
  //console.log('Marking process as killed', p)
  //console.log(reason)
  //console.trace()
  //console.log('--------')
  //
  p.status = 'killed'
  p.foundDeadAt = new Date()
  p.markedAsDeadReason = reason
}

////////////////////////////////////////////////////////////////////////////////

function isProcessesStartedAtSameTime(a, b) {
  return moment(a.started).isSame(moment(b.started))
  //return a.etimes === b.etimes
  //return a.startedStr === b.startedStr
}

////////////////////////////////////////////////////////////////////////////////

function findRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootMarkerFile = findUp.sync('pnpm-workspace.yaml')
  if (!rootMarkerFile) return process.cwd()
  return path.dirname(rootMarkerFile)
}
