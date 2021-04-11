import {run} from '@src/main'

// WIP
// API for programmatic usage.

export default async function index(opts) {

  // TODO(vjpr): Get all files.
  const allFiles = {}
  const watcher = {
    query() {
      return allFiles
    }
  }
  await run(opts, {allFiles, watcher})

}
