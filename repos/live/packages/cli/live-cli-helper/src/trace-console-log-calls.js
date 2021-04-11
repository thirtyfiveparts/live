module.exports = function traceConsoleLogCalls() {
  function yellow(str) {
    return '\x1b[33m' + str + '\x1b[0m'
  }
  if (parseInt(process.env.ENABLE_CONSOLE_CALLER)) {
    // TODO(vjpr): __dirname deprecated.
    const msg = `Console calls are intercepted and will print their paths. See: ${__filename}}`
    console.log(yellow(msg))
    // For showing the caller location of `console.log` statements.
    const stackOffset = undefined // For zog logging lib - change the value.
    require('console-caller')(global.console, stackOffset)
  }
}
