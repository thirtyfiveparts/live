import glob from 'globby'
import _ from 'lodash'
import fse from 'fs-extra'
import fs from 'fs'
import rde from 'readdir-enhanced'
import fastGlob from 'fast-glob'
import micromatch from 'micromatch'
import path, {join} from 'path'

const isDir = f => fs.existsSync(f) && fse.lstatSync(f).isDirectory()

/* NOTE about `dir-compare`
// Could not use this `dir-compare` because it didn't handle non-existent symlink targets.
//const excludeFilter = excludes.join(',')
//const opts = {
//  skipSubdirs: false,
//  skipSymlinks: true, // Because of bug.
//  excludeFilter,
//  compareContent: true,
//}
//const diffSet = await dirCompare.compare(srcDir, destDir, opts)
*/

/*

globby / fast-glob - doesn't include symlinks that point to non-existent files.

*/

export default async function(srcDir, destDir, {ignore}) {
  const globOpts = {
    followSymbolicLinks: false,
    dot: true,
    ignore,
    // TODO(vjpr): https://github.com/mrmlnc/fast-glob/issues/207#issuecomment-502796594
    // See `throwErrorOnBrokenSymbolicLink`.
    // Allows us to match symlinks pointing to non-existent files.
    onlyFiles: false,
    // --
    markDirectories: true,
  }
  const filesSrc = await glob('**', {...globOpts, cwd: srcDir})
  const filesDest = await glob('**', {...globOpts, cwd: destDir})
  //console.log({filesSrc, filesDest})

  const leftDir = srcDir
  const rightDir = destDir
  const left = filesSrc
  const right = filesDest

  let type1
  let type2

  const files = _.union(left, right)
  const res = files.map(f => {

    // NOTE: Abs paths.
    const leftFile = left.includes(f) && join(leftDir, f)
    const rightFile = right.includes(f) && join(rightDir, f)
    let state

    let mtime1
    let mtime2

    if (leftFile && rightFile) {
      // Check for non-existent symlink target.
      // TODO(vjpr): Actually check for symlink.
      if (!fse.existsSync(rightFile) || !fse.existsSync(leftFile)) {

        //console.log(`${rightFile} or ${leftFile} doesn't exist`)
        // Skip comparison, they are different.
        state = 'distinct'
        type1 = isDir(leftFile) ? 'directory' : 'file'
        type2 = isDir(rightFile) ? 'directory' : 'file'

        return
      }

      // TODO(vjpr): Do better comparison
      //fs.readFile(leftFile) fse.statSync(rightFile)
      ////////////////////

      const leftFileMtime = fse.statSync(leftFile).mtime.getTime()
      const rightFileMtime = fse.statSync(rightFile).mtime.getTime()
      mtime1 = leftFileMtime
      mtime2 = rightFileMtime

      //console.log('isDir=', isDir(leftFile), leftFile, mtime1)
      //console.log('isDir=', isDir(rightFile), rightFile, mtime2)

      if (leftFileMtime > rightFileMtime) {
        state = 'distinct'
      } else if (leftFileMtime < rightFileMtime) {
        state = 'distinct'
      } else if (leftFileMtime === rightFileMtime) {
        state = 'equal'
      } else {
        state = 'dontknow'
      }
      // --
      type1 = isDir(leftFile) ? 'directory' : 'file'
      type2 = isDir(rightFile) ? 'directory' : 'file'

    } else if (leftFile) {

      // Only left file exists
      ////////////////////

      state = 'left'
      //console.log('isDir=', isDir(leftFile), leftFile)
      type1 = isDir(leftFile) ? 'directory' : 'file'
      type2 = 'missing'

    } else if (rightFile) {

      // Only right file exists
      ////////////////////

      state = 'right'
      type1 = 'missing'
      type2 = isDir(rightFile) ? 'directory' : 'file'

    }

    return {
      path1: leftDir,
      path2: rightDir,
      name1: f,
      name2: f,
      type1,
      type2,
      state,
      mtime1,
      mtime2,
    }
  })

  return res
}
