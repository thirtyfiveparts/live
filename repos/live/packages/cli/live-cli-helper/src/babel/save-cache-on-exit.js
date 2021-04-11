const Debug = require('debug')
const debug = Debug('live-cli-helper')

// The `@babel/cache` is only saved on `exit` and `nextTick`. nextTick doesn't work after a while for some reason.
// NOTE: I thought it was disabled when `--inspect` is on, but it wasn't.
/*

_@babel/register/lib/cache.js_

```
process.on("exit", save);
process.nextTick(save);
```

*/
// TODO(vjpr): When the debugger is connected, the http server is not terminated.

// If your server is still running use this to kill it during debug.
// sudo kill -9 $(sudo lsof -t -i:3000)

module.exports = function() {
  const argv = process.execArgv
  const isDebug = argv.includes('--inspect') || argv.includes('--debug')
  if (!isDebug || process.env.ALWAYS_SAVE_BABEL_CACHE) {
    // Disable during debug because otherwise process never exits.
    // TODO(vjpr): But this prevents transpile saving which means we are always slow!
    saveBabelRegisterCacheOnExit()
  }
}

function saveBabelRegisterCacheOnExit() {
  process.on('SIGINT', function() {
    log('[@live/cli-helper] ctrl+c was pressed')
    require('@babel/register/lib/cache').save()
    log('[@live/cli-helper] @babel/register cache saved.')

    // See `wtfnode` + `https://github.com/mafintosh/why-is-node-running` lib.
    const procs = {
      handles: process._getActiveHandles(),
      requests: process._getActiveRequests(),
    }

    //console.log(procs)

    // NOT WORKING
    //process._getActiveHandles().map(h => {
    //  console.log('closing handle', h)
    //  //h._destroy(() => {  })
    //  // They can be many different types.
    //  h.destroy && h.destroy()
    //  h.stop && h.stop()
    //  h.close && h.close()
    //  h.end && h.end()
    //})

    // This seems to trigger the exit save again.
    process.exit()
  })

  process.on('exit', () => {
    log('[@live/cli-helper] process.on(exit) called')
  })
}

function log(...args) {
  debug(...args)
}
