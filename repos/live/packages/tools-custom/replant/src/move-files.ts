const debug = require('debug')('move-files')
import path, {join} from 'path'
import _ from 'lodash'

// We need to backup all files where their destinations are changing as they
// could be being overwritten.

export default async function({fs, cwd, delta, dryRun}) {

  //const fse = require('fs-extra')

  const isAddition = d => d.length === 1
  const isModification = d => d.length === 2
  const isDeletion = d => d.length === 3

  // We need to backup the data for files that are being overridden.
  const fileIdToContents = makeFileContentsMap({cwd, fs, delta})

  debug(fileIdToContents)

  for (const k in delta) {

    const deltaItem = delta[k]

    if (isModification(deltaItem)) {

      const [from, to] = deltaItem
      debug('Moving', from, '->', to)
      if (!dryRun) fs.move(join(cwd, from), join(cwd, to))

    } else if (isAddition(deltaItem)) {

      const [file] = deltaItem
      debug('Adding', file)
      if (!dryRun) fs.write(join(cwd, file), '')

    } else if (isDeletion(deltaItem)) {

      const [file] = deltaItem
      debug('Deleting', file)
      if (!dryRun) fs.delete(join(cwd, file))

    }

  }

}

function makeFileContentsMap({cwd, fs, delta}) {
  const isModification = d => d.length === 2
  const fileIdToContents = {}
  for (const fileId in delta) {
    const d = delta[fileId]
    if (isModification(d)) {
      const [from, to] = d
      const fromPath = join(cwd, from)
      if (fs.exists(fromPath)) {
        fileIdToContents[fileId] = fs.read(fromPath)
      }
    }
  }
  return fileIdToContents
}

