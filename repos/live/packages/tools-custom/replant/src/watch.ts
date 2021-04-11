import {Watcher} from '@live/watchman-wrapper/src/defaults/source-code-files'
import {getWorkspacePackages, getRepoRoot} from '@live/get-workspace-pkgs'
import debouncePromise from 'debounce-promise'
import {run} from '@src/main'

export async function watch(opts) {

  const root = getRepoRoot()

  const anyof = [['match', '.replant.yml']]
  const exts = ['.*']
  const watcher = new Watcher('replant-watcher', exts, root, anyof)
  let firstRun = true

  // We use watchman to list files. We also use it to run replant command on file change.
  if (!opts.watch) {
    await watcher.init({shouldWatch: false})
    const allFiles = await watcher.query()
    await mainFn({opts, allFiles, changedFiles: [], firstRun, root, watcher})
    return
  }
  // --

  // TODO(vjpr): I think we only should use this to keep our replant file up-to-date...
  //   Replanting should be manually invoked.
  //   Or we can have a keyword that they type at the top of the file to indicate they want to go for it.
  await watcher.init({shouldWatch: true})
  let running
  const debouncedRun = debouncePromise(mainFn) // Runs on trailing edge of interval by default.
  watcher.onChange(async changedFiles => {
    console.log('Changed file count:',  changedFiles.length)
    const allFiles = await watcher.query()
    const isWatchEvent = true
    // `.then` is deliberate because we want to set `firstRun` immediately afterwards.
    // TODO(vjpr): I think we need to add a lock to this function. Don't allow multiple execution.
    debouncedRun({opts, allFiles, changedFiles, firstRun, root, watcher, isWatchEvent}).then()
    firstRun = false
  })

}

async function mainFn({opts, allFiles, changedFiles, firstRun, root, watcher, isWatchEvent}) {

  console.log('hey!')
  await run(opts, {allFiles, changedFiles, watcher, isWatchEvent})

}
