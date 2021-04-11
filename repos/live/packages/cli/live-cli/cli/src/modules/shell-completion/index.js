// TODO(vjpr): Make fast, its run every time we start the terminal!

import omelette from 'omelette'
import log from './log'

/*
Testing:

$ live --compzsh --compgen 2 live live
*/

export default function(cb) {
  const completion = omelette(`live|lives`)

  //completion.on('$1', ({reply}) => reply(['hello', 'world']))

  completion.onAsync('complete', cb)

  //completion.on('complete', (fragment, {reply, line}) => {
  //  const args = line.split(' ')
  //  log(process.pid)
  //  log(args.length)
  //  log(args)
  //  log({fragment})
  //
  //  ;('live app foo')
  //
  //  if (args[1] === 'app')
  //    if (args.length) {
  //      reply(firstArgs)
  //      return
  //    }
  //})

  completion.init()

  if (~process.argv.indexOf('--setup-completion')) {
    completion.setupShellInitFile()
  }

  if (~process.argv.indexOf('--cleanup-completion')) {
    completion.cleanupShellInitFile()
  }
}

export const isShellCompletionMode = ~process.argv.indexOf('--compgen')

export {default as log} from './log'
