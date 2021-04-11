import shellCompletion, {isShellCompletionMode, log} from './modules/shell-completion'
import {perf} from '@live/log/es5' // Needed for jsperf

export default async function() {

  // jsperf
  const {default: main} = await import('./modules/index')

  if (isShellCompletionMode) {
    shellCompletion(async (frag, completion) => {
      log({completion})
      // fragment - the last complete command
      // E.g. (note the trailing space)
      //   `live app` => 1
      //   `live app ` => 2
      const {reply, line, fragment} = completion
      // Must remove exe name because `main` expects no exe.
      const pargv = line.split(' ').slice(1).join(' ')
      await main({pargv, completion})
    })
  } else {
    await main()
  }

}
