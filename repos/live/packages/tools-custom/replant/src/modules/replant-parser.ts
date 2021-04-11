// @flow weak
const debug = require('debug')('replant-parser')
const yaml = require('js-yaml')
const hash = require('object-hash')
const glob = require('globby')
const fs = require('fs')
const {unflatten, flatten} = require('flat')
const _ = require('lodash')
import path, {join} from 'path'
import c from 'chalk'

export async function readFiles(cwd, allFiles, watcher) {
  // Watchman.
  //return readFilesGlob(cwd)
  allFiles = await watcher.query()
  return allFiles.filter(f => f.type !== 'd').map(f => f.name).sort()
}

//export function readFilesGlob(cwd) {
//  const files = glob.sync('**/*', {
//    ignore: ['**/node_modules/**', 'tmp/**', '.git/**', 'build/**', '.vagrant/**', '.idea/**', 'lib/**'],
//    dot: true,
//    nodir: true,
//    cwd,
//  })
//  return files
//}

async function getNewTreeFromFile({debug, cwd, replantPath, replantFileName, replantFileNameCurrent, runReplantAgainTxt, allFiles, watcher}) {

  // Check if file structure has changed since last replant file was generated. If it has, the file needs to be regenerated.

  // Get unmodified previous replantfile.
  //const unmodifiedReplantfile = fs.readFileSync(join(cwd, replantFileNameCurrent), 'utf8')

  // Get filesystem hash.
  const currentFiles = await readFiles(cwd, allFiles, watcher)
  const currentHash = hash(currentFiles)

  // Get current replantfile hash.
  let newReplantObj = readReplantFile(replantPath)
  if (!newReplantObj.__hash__) {
    // TODO(vjpr): Allow the user to force the change with -f.
    const msg = `No '__hash__' key found in ${replantFileName}. ${runReplantAgainTxt}`
    console.error(msg)
    throw msg
  }

  // Compare hashes
  const oldHash = newReplantObj.__hash__
  const sameStructure = currentHash === oldHash
  if (!sameStructure && !debug) {
    const msg = `The dir structure has changed since you last ran 'replant'. ${runReplantAgainTxt}`
    console.error(msg)
    throw msg
  }

  // --

  // Get modified replant file as object.

  return newReplantObj

}

export async function parseReplantFile({script, cwd, replantPath, replantFileName, runReplantAgainTxt, allFiles, watcher}) {

  const files = await readFiles(cwd, allFiles, watcher)

  // What our replantfile was before user made changes. This is the replantfile reflecting the current disk state.
  let oldReplantObj = serializeDir(files)

  // This is the current parsed replantfile.
  let newReplantObj

  if (script) {
    // Use js script.
    if (_.isString(script)) {
      newReplantObj = require(join(cwd, script))(oldReplantObj)
    } else if (_.isFunction(script)) {
      newReplantObj = script(oldReplantObj)
    } else {
      throw 'script must be a string or a function'
    }
  } else {
    // Use file.
    newReplantObj = await getNewTreeFromFile({debug, cwd, replantPath, replantFileName, runReplantAgainTxt, allFiles, watcher})
  }

  // TODO(vjpr): Do we exclude replant file from diff?

  newReplantObj = flatten(newReplantObj, {delimiter: '/'})
  delete newReplantObj.__hash__

  // Remove multiple slashes.
  //
  // foo/
  //   .keep: 1
  //

  newReplantObj = _(newReplantObj).mapKeys((v, k) => path.normalize(k)).value()
  //debug(newReplantObj)

  //
  // If a key's value is null, we assume its a dir, and add a `.keep` file.
  // NOTE: We could use a null field for either a new file or a dir.
  //   It was decided to use for a dir, because when you are shifting around
  //   files in the yaml, you don't want to accidentally turn a dir into a file,
  //   if you move away all its children.
  //

  newReplantObj = _(newReplantObj)
    .mapKeys((v, k) =>
      //(k.endsWith('/') && v === null) ? k + '.keep' : k)
      v === null ? k + '/.keep' : k)
    .value()

  // For new files, replace 0 with a uniqueId, so we can still invert if new files were added.

  // TODO(vjpr): Potential edge case when empty dir. Looks fine but test.
  let nextId = _.max(Object.values(newReplantObj)) + 1

  newReplantObj = _(newReplantObj)
    .mapValues(v => (v === 0 || v === null) ? nextId++ : v).value()

  fs.writeFileSync(join(cwd, '.replant.flat.old.yml'), yaml.dump(oldReplantObj))
  fs.writeFileSync(join(cwd, '.replant.flat.current.yml'), yaml.dump(newReplantObj))

  return {fileToIdCurrent: oldReplantObj, fileToIdNext: newReplantObj}

}

// TODO(vjpr): I don't think these are opposites of each other. Name them better.

// From replantfile to object.
function readReplantFile(replantPath) {
  try {
    const json = yaml.load(fs.readFileSync(replantPath, 'utf8'))
    return json
  } catch (e) {
    console.error(`Error while parsing replantfile: ${replantPath}`)
    console.error(c.red(e.toString()))
    const {buffer, ...markOpts} = e.mark
    // TODO(vjpr): Handle duplicate key error.
    //console.error({...markOpts, buffer: '(redacted)'})
    throw new Error()
  }
}

export function deserializeDir(yamlObj) {

}

// From object to replantfile.
// We assign an ID to every file so that when it is moved or renamed in the `.replant.yml` we know exactly which file it corresponded to.
// NOTE: Assumes files are sorted by `.sort()`.
export function serializeDir(files) {
  let id = 1
  const obj = _.zipObject(files, _.map(files, (f) => parseInt(id++)))
  return obj
}
