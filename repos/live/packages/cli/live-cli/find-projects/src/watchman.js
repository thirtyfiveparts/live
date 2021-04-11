import Watchman from '@live/watchman-wrapper'

// Check if a `package.json` file has changed in the cwd using watchwan.
export async function hasPackageJsonChangedViaWatchman({repoRoot, since}) {
  //const files = new Map()
  //files.set(root, resp)
  //return files

  const watchman = new Watchman()
  await watchman.init()
  const root = repoRoot
  const {watch, relativePath} = await watchman.watchRoot(root)

  // Query watchman
  ////////////////////

  // Watch all `package.json` files and no `node_modules` dirs.

  // aka. `watchman since . c:1:2 '**/package.json' -- -X **/node_modules/**`
  const expression = [
    'allof',
    // NOTE: The `wholename` is the name of the file relative to the watched root.
    ['match', '**/package.json', 'wholename'],
    [
      'not',
      ['match', '**/node_modules/**', 'wholename', {includedotfiles: true}],
    ],
  ]
  const fields = ['name', 'exists', 'mtime_ms', 'size', 'content.sha1hex']
  const glob = undefined
  const glob_includedotfiles = undefined
  if (since) {
    since = Math.floor(since / 1000) // Convert to unix seconds since epoc timestamp.
  }
  const query = {expression, fields, since, glob, glob_includedotfiles}

  const resp = await watchman.query(query, root)

  await watchman.end()

  const numberOfFilesChanged = resp.files.length

  return numberOfFilesChanged > 0
}

