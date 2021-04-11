import watcher from '@src/modules/watch'

export default async function watch({pargv, config, cwd, repoRoot}) {
  console.log('Run watcher!')

  const _watcher = await watcher()

  //const commands = {
  //  async start() {
  //    return 'start'
  //  },
  //  async status() {
  //    return 'status'
  //  },
  //}
  //
  //const firstArg = pargv[0]
  //let cmd
  //if (!firstArg) {
  //  cmd = commands.start
  //} else {
  //  cmd = commands[firstArg]
  //}
  //if (!cmd) {
  //  // TODO(vjpr): Show help.
  //  return
  //}

}
