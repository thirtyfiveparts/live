import _ from 'lodash'
import c from 'chalk'

export default class CLI {
  isActive = true
  delimiter = '--> '
  logging = true
  // Are we in interactive mode for this process?
  inUse = false

  constructor({main}) {
    this.main = main
  }

  // We init separately because it breaks `process.on('SIGINT')`
  init() {
    this.inUse = true
    const readline = require('readline')
    this.readline = readline
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      completer: (line, callback) => {
        let val
        const reply = (arr) => {
          val = [arr, line]
        }
        // TODO(vjpr): Do we need fragment?
        this.main({pargv: line, completion: {fragment: 2, reply}}).then(() => {
          val = val || []
          callback(null, val)
        })
      },
      prompt: this.delimiter,
    })
    this.rl.pause()
  }

  async prompt() {
    return new Promise(resolve => {
      this.rl.question(this.delimiter, resolve)
    })
  }

  log(io, data) {
    if (!this.inUse) return
    if (!this.logging) return
    // TODO(vjpr): If there is current input, copy down to next prompt.
    //   So if user was half way through a command they don't see it disappear.
    this.readline.clearLine(process.stdout, 0)
    this.readline.cursorTo(process.stdout, 0) // Need to reset cursor to beginning of line.
    io.write(data)
    this.rl.prompt()
    return true
  }

  // See rl.prompt().
  //showPrompt() {
  //  this.rl.write(this.delimiter)
  //}

  async executeCommand(input) {
    if (input === 'debug off') {
      this.logging = false
    }
    if (input === 'debug on') {
      this.logging = true
    }
    await this.main({pargv: input})
  }

  show() {
    this.rl.resume()
    this.isActive = true
    this.startREPL()
  }

  hide() {
    this.rl.pause()
    this.isActive = false
  }

  async startREPL() {
    while (this.isActive) {
      const input = await this.prompt()
      await this.executeCommand(input).catch(e => console.log(e))
    }
  }
}
