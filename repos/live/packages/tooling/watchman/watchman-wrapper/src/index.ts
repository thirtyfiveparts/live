// See Jest's usage for reference: https://github.com/facebook/jest/blob/master/packages/jest-haste-map/src/crawlers/watchman.ts

import watchman from 'fb-watchman'
import to from 'await-to'
const EventEmitter = require('events')

class MyEmitter extends EventEmitter {}

export default class Watchman {
  cmd: any
  clientError: any
  client: any

  async init() {
    this.emitter = new MyEmitter()

    this.client = new watchman.Client()
    const client = this.client

    const capabilityCheck = promisifyFn(client, 'capabilityCheck')
    this.cmd = promisifyCmd(client)

    const [err, resp] = await to(
      capabilityCheck({optional: [], required: ['relative_root']}),
    )
    if (err) {
      console.log(err)
      client.end()
      return
    }

    client.on('error', error => (this.clientError = WatchmanError(error)))
  }

  // Watch root if not already doing so.
  async watchRoot(root) {
    const [err, resp] = await to(this.cmd('watch-project', root))
    if (err) {
      throw err
    }
    return {
      ...resp,
      relativePath: resp.relative_path,
    }
  }

  async query(query, root) {
    // TODO(vjpr): Maybe we could use `glob`?
    // TODO(vjpr): This timesout if there was a previous error with the query. Wierd.
    const [err, resp] = await to(this.cmd('query', root, query))
    if (err) {
      if ('The watchman connection was closed' in err) {
        // To see full error run `ps aux | grep watchman`.
        //   E.g. /usr/local/var/run/watchman/Vaughan-state/log.
        throw err
      }
      throw err
    }
    if ('warning' in resp) {
      console.warn('watchman warning: ', resp.warning)
    }

    // TODO(vjpr): What is this for?
    //this.isFresh = this.isFresh || resp.is_fresh_instance

    if (this.clientError) {
      console.log('live-cli has detected a watchman error:')
      console.error(this.clientError)
      this.clientError = null // Reset
    }

    return resp
  }

  async subscribe(watch, subscriptionName, sub) {
    const [err, resp] = await to(
      this.cmd('subscribe', watch, subscriptionName, sub),
    )
    if (err) {
      throw err
    }
    console.log(`Subscription '${resp.subscribe}' established.`)

    this.client.on('subscription', resp => {
      if (resp.subscription !== subscriptionName) return
      // TODO(vjpr):  files
      resp.files.forEach(file => {
        file.mtimeMs = +file.mtime_ms
      })
      this.emitter.emit('change', resp.files)
    })
  }

  onEvent(cb) {
    this.emitter.on('change', cb)
  }

  // NOTE: Must end watchman session or our process will never exit.
  async end() {
    this.client.end()
  }
}

////////////////////////////////////////////////////////////////////////////////

function promisifyCmd(client) {
  return (...args) =>
    new Promise((resolve, reject) =>
      client.command(args, (error, result) =>
        error ? reject(WatchmanError(error)) : resolve(result),
      ),
    )
}

function promisifyFn(client, fn) {
  return (...args) =>
    new Promise((resolve, reject) =>
      client[fn](args, (error, result) =>
        error ? reject(WatchmanError(error)) : resolve(result),
      ),
    )
}

const watchmanURL = 'https://facebook.github.io/watchman/docs/troubleshooting'

function WatchmanError(error) {
  error.message =
    `Watchman error: ${error.message.trim()}. Make sure watchman ` +
    `is running for this project. See ${watchmanURL}.`
  return error
}

////////////////////////////////////////////////////////////////////////////////

// Test watchman query

// WARNING: dotfiles are not included when using globs.
// watchman since /root n:clockspec "*.package.json"

// See watchman.sh
