import Watchman from '@live/watchman-wrapper'
import to from 'await-to'
import EventEmitter from 'events'

class MyEmitter extends EventEmitter {}

export default class Watcher {
  tsQuery: any
  watchman: any

  async init() {
    this.emitter = new MyEmitter()

    this.watchman = new Watchman()
    await this.watchman.init()
    const root = process.cwd()
    const {watch, relativePath} = await this.watchman.watchRoot(root)
    this.root = watch

    const subscriptionName = 'graphql-codegen'

    this.tsQuery = {
      expression: [
        'allof',
        ['match', '*.tsx'],
        [
          'not',
          // includedotfiles is necessary to match `.pnpm` dir.
          ['match', '**/node_modules/**', 'wholename', {includedotfiles: true}],
          // This also works...
          //['not', ['match', '**/node_modules/\.pnpm/**', 'wholename']],
        ],
      ],
      fields: ['name', 'size', 'mtime_ms', 'exists', 'type'],
      relative_root: relativePath,
      glob: undefined,
      //glob: ['!**/node_modules/**'],
      glob_includedotfiles: true,
    }

    // Subscribe.

    const [err, resp] = await to(
      this.watchman.subscribe(watch, subscriptionName, this.tsQuery),
    )
    if (err) {
      throw err
    }

    this.watchman.onEvent(resp => {
      this.emitter.emit('event', resp)
    })
  }

  async query() {
    const [err, resp] = await to(this.watchman.query(this.tsQuery, this.root))
    if (err) {
      throw err
    }
    return resp.files
  }

  onChange(cb) {
    this.emitter.on('event', cb)
  }
}
