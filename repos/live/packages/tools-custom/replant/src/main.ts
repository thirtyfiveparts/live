import Debug from 'debug'

import fs from 'fs'
import yaml from 'js-yaml'
import {unflatten} from 'flat'
import _ from 'lodash'
import hash from 'object-hash'
import path, {join} from 'path'
import diff from 'jsondiffpatch'
import c from 'chalk'
import memFs from 'mem-fs'
import memFsEditor from 'mem-fs-editor'
import pify from 'pify'

import {
  parseReplantFile,
  readFiles,
  serializeDir,
} from '@src/modules/replant-parser'
import doRefactor from '@src/refactor/do-refactor'
import moveFiles from '@src/move-files'
import inquirer from 'inquirer-promise'
import {promisify} from 'util'
import {getConfig} from '@src/cli/index'

const debug = Debug('replant')

const dirtyReplant = false

export async function run(opts = {}, {allFiles, changedFiles, watcher, isWatchEvent} = {}) {
  // TODO(vjpr): We call this here and in the CLI because this function is called directly from the tests.
  //   We should fix this.
  opts = getConfig(opts)

  ////////////////////
  // TODO(vjpr): Handle watch events.

  if (isWatchEvent) {
    // If user changed replantfile, we mark it as dirty so we don't reset it.
    // Otherwise, we reset the replantfile to match the filesystem.
    if (isReplantfileModified(changedFiles, opts.replantFileName)) {
      dirtyReplant = true
      // TODO(vjpr): Don't do anything unless user types a keyword in the top of the file or manually commits.
      return
    } else {
      //opts.reset = true
      return
    }
  }

  ////////////////////

  debug('opts', opts)

  const {
    cwd,
    dryRun,
    replantFileName,
    replantFileNameCurrent,
    replantFileNameHelp,
  } = opts

  intro({quiet: opts.quiet})

  //////////////////////////////////////////////////////////////////////////////

  // TODO(vjpr): I don't know why this was relative before?
  //const replantPath = relative(cwd, replantFileName)
  const replantPath = join(cwd, replantFileName)

  //////////////////////////////////////////////////////////////////////////////

  const {script, init, reset} = opts
  const notFound = await writeReplantFileIfNotFound({
    cwd,
    script,
    init,
    reset,
    replantPath,
    replantFileName,
    replantFileNameCurrent,
    allFiles,
    dryRun,
    watcher,
  })
  if (notFound) return

  if (reset) return

  //////////////////////////////////////////////////////////////////////////////

  // After changes to yml are made we "commit" them which converts them to file system operations.
  if (opts.commit) {
    await commit()
  }

  async function commit() {
    debug('Committing changes')

    ////////////////////////////////////////////////////////////////////////////
    // Parse file
    ////////////////////////////////////////////////////////////////////////////

    const runReplantAgainTxt = `Please run 'replant -i' to create a new '${replantFileName}' file. NOTE: This will override your changes.`
    let {fileToIdCurrent, fileToIdNext} = await parseReplantFile({
      script,
      cwd,
      replantPath,
      replantFileName,
      runReplantAgainTxt,
      allFiles,
      watcher,
    })

    ////////////////////////////////////////////////////////////////////////////
    // Diff
    ////////////////////////////////////////////////////////////////////////////
    //
    // Shows delete, add, move operations.
    //

    //
    // Swap keys and values for easier diffing.
    //
    // {'foo/bar/baz': 1} -> {1: 'foo/bar/baz'}
    // Here, `1` represents the contents of file #1, as the name can be changed.
    //
    let idToFileCurrent = _.invert(fileToIdCurrent)
    let idToFileNext = _.invert(fileToIdNext)
    // Verbose...
    //debug('File manifests', {idToFileCurrent, idToFileNext})

    // NOTE: This will generate a huge diff on everything if the ordering is messed up.
    const delta = diff.diff(idToFileCurrent, idToFileNext)

    if (!delta) {
      console.log('No change.')
      return
    }

    printJsonStructureDiff(delta)

    ////////////////////////////////////////////////////////////////////////////
    // Create memory fs.
    ////////////////////////////////////////////////////////////////////////////

    debug('Create mem-fs')
    const store = memFs.create()
    const editor = memFsEditor.create(store)

    ////////////////////////////////////////////////////////////////////////////
    // Refactor
    ////////////////////////////////////////////////////////////////////////////

    await doRefactor({fs: editor, delta, cwd, dryRun})

    ////////////////////////////////////////////////////////////////////////////
    // Update memory fs
    ////////////////////////////////////////////////////////////////////////////

    // TODO: Confirm changes unless -q.

    await moveFiles({fs: editor, cwd, delta, dryRun})

    printMemFsDiff(store)

    printPrettyDiff(delta, store)

    ////////////////////////////////////////////////////////////////////////////
    // Confirm
    ////////////////////////////////////////////////////////////////////////////

    if (!opts.noPrompt) {
      const confirm = await inquirer.confirm('Write?')
      if (!confirm) return
    }

    ////////////////////////////////////////////////////////////////////////////
    // Write - Make changes to file system (unless dry run)
    ////////////////////////////////////////////////////////////////////////////

    debug('Commit')
    const editorCommitP = pify(editor.commit.bind(editor))
    await editorCommitP()

    ////////////////////////////////////////////////////////////////////////////
    // Update replant file with new tree+hash
    ////////////////////////////////////////////////////////////////////////////

    // The hash of the dir structure will always change.
    // TODO(vjpr): If we allow use of generators, this is when the tree will change.

    // TODO(vjpr): Maybe we can just use the new replant obj and update numbers.
    //   CON: What if our update triggers some other scripts to add new files...

    // Because file-system has changed we must get new files.
    // -> This is done insude the writeReplantFile now.

    await writeReplantFile({
      cwd,
      replantPath,
      fileType: 'yml',
      allFiles,
      dryRun,
      watcher,
      replantFileNameCurrent,
    })
    console.log('Updated ' + replantFileName)
  }

  console.log(
    '-----------------------------------------------------------------------------',
  )
}

function printPrettyDiff(delta, store) {
  const isAddition = d => d.length === 1
  const isModification = d => d.length === 2
  const isDeletion = d => d.length === 3
  const log = (state, str) => console.log(_.padStart(state, 7) + ' ', str)

  const vinylFiles = {}
  store.each(f => (vinylFiles[f.relative] = f))

  function isFileContentsModified(p) {
    const f = vinylFiles[p]
    //debug(JSON.stringify(f, null, 2))
    if (!f) return
    return getVinylFileState(f) === 'modified'
  }

  console.log('Planned changes:')
  console.log()
  for (const k in delta) {
    const deltaItem = delta[k]
    if (isModification(deltaItem)) {
      const [from, to] = deltaItem
      const color = isFileContentsModified(to) ? 'yellow' : 'green'
      log('move', `${c.red(from)} -> ${c[color](to)}`)
    } else if (isAddition(deltaItem)) {
      const [file] = deltaItem
      log('add', c.green(file))
    } else if (isDeletion(deltaItem)) {
      const [file] = deltaItem
      log('delete', c.red(file))
    }
  }
  console.log()
}

function printJsonStructureDiff(delta) {
  debug('Diff:')
  // TODO(vjpr): Sometimes the diff only shows word changes. Bit confusing...
  //   Should show line to line only. Or maybe we just do our own.
  const output = diff.formatters.console.format(delta)
  debug(output)
  debug('Delta:', JSON.stringify(delta, null, 2))
}

// TODO(vjpr): Moves are copies and deletions. This is not best.
function printMemFsDiff(store) {
  const files = []
  store.each(f => files.push(f))
  files.map(f => {
    //debug(JSON.stringify(f, null, 2))
    const state = getVinylFileState(f)
    debug(_.padEnd(state, 10) + ' ' + f.path)
  })
}

function getVinylFileState(f) {
  if (f.state === 'modified') {
    return f.isNew === true ? 'new' : 'modified'
  } else {
    return f.state
  }
}

export async function writeReplantFile({
  cwd,
  replantPath,
  allFiles,
  dryRun,
  watcher,
  replantFileNameCurrent,
}) {
  debug('Reading files...')
  const files = await readFiles(cwd, allFiles, watcher)
  debug('Hashing files...')
  const __hash__ = hash(files)
  debug('Serializing dir...')
  const flatFilesObj = serializeDir(files)
  //console.log(flatFilesObj)
  // We need to use `opts.overwrite` if `flatFilesObj` contains dirs.
  // TODO: If we wanted to use dirs in the `replant.yml` we would have to add slashes to them all.
  //   Its a bit too verbose for my liking when creating new dirs.
  //   But it would alleviate some confusion.
  const nestedObj = {
    __hash__,
    ...unflatten(flatFilesObj, {
      delimiter: path.sep,
      overwrite: true,
      // We must enable this or otherwise folder such as `foo/0` will be converted to arrays. See: https://www.npmjs.com/package/flat#object.
      object: true,
    }),
  }

  // Create .replant.yml with current dir structure.
  function toString(nestedObj) {
    switch (path.extname(replantPath)) {
      case '.yaml':
      case '.yml':
        return yaml.dump(nestedObj)
      case '.json':
        return JSON.stringify(nestedObj, null, 2)
      case '.js':
        return 'module.exports = ' + JSON.stringify(nestedObj, null, 2)
      case '.hjson':
        break
    }
  }

  const out = toString(nestedObj)
  if (!dryRun) fs.writeFileSync(replantPath, out)
  if (!dryRun) fs.writeFileSync(join(cwd, replantFileNameCurrent), out)
}

async function writeReplantFileIfNotFound({
  cwd,
  script,
  init,
  reset,
  replantPath,
  replantFileName,
  replantFileNameCurrent,
  allFiles,
  dryRun,
  watcher,
}) {
  if (!script && (!fs.existsSync(replantPath) || init || reset)) {
    console.log(
      c.yellow(`Replant file not found. Search path: '${replantPath}'`),
    )
    console.log(c.yellow('Creating...'))
    await writeReplantFile({
      cwd,
      replantPath,
      fileType: 'yml',
      allFiles,
      dryRun,
      watcher,
      replantFileName,
      replantFileNameCurrent,
    })
    console.log(c.green('Generated ' + replantFileName))
    return true
  }
  return false
}

function intro({quiet}) {
  if (!quiet) console.log('Welcome to Replant')
}

////////////////////////////////////////////////////////////////////////////////

//function getPatch({fileToIdCurrent, fileToIdNext}) {
//  const fstree = require('fs-tree-diff')
//  const current = fstree.fromPaths(Object.keys(fileToIdCurrent))
//  const next = fstree.fromPaths(Object.keys(fileToIdNext))
//  const patch = current.calculatePatch(next)
//  console.log(patch)
//}
//getPatch({fileToIdCurrent, fileToIdNext})

////////////////////////////////////////////////////////////////////////////////

function isReplantfileModified(changedFiles, replantFileName) {
  // Don't reset if user modified the replantfile.
  if (changedFiles.some(f => f.name.endsWith(replantFileName))) {
    return true
  }
}
