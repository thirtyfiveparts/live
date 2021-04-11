import Watchman from '../index'
import to from 'await-to'
import EventEmitter from 'events'

class MyEmitter extends EventEmitter {}

export class Watcher {
  tsQuery: any
  watchman: any
  private root
  private exts
  private subscriptionName

  constructor(subscriptionName, exts, root, anyof) {
    this.root = root
    this.exts = exts
    this.anyof = anyof
    this.subscriptionName = subscriptionName
  }

  async init({shouldWatch} = {}) {
    shouldWatch = shouldWatch ?? true
    this.emitter = new MyEmitter()

    this.watchman = new Watchman()
    await this.watchman.init()
    const root = this.root ?? process.cwd()
    const {watch, relativePath} = await this.watchman.watchRoot(root)
    this.root = watch

    const {subscriptionName} = this

    this.tsQuery = {
      expression: [
        'allof',
        // E.g. ['match', '*.tsx'],
        // TODO(vjpr): Why not use `['suffix', 'ts']...`
        [
          'anyof',
          ...this.exts.map(ext => ['match', '*' + ext]),
          ['match', 'package.json'],
          ...(this.anyof ?? []),
        ].filter(Boolean), // If `this.anyof` doesn't exist.
        // --
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

    // DEBUG
    console.log(JSON.stringify(this.tsQuery, null, 2))

    // Subscribe.

    if (shouldWatch) {
      const [err, resp] = await to(
        this.watchman.subscribe(watch, subscriptionName, this.tsQuery),
      )
      if (err) {
        throw err
      }
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
