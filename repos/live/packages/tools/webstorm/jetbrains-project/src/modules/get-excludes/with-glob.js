import _ from 'lodash'
import glob from 'globby'
import path, {join} from 'path'

import minimatch from 'minimatch'

// Given an array of dir names, search for these dirs with these names, but don't search inside them.
// Returns paths (relative to cwd) to matched dirs.
export default function findDirShallow({dirGlobs, cwd, cache}) {
  dirGlobs = _.castArray(dirGlobs)

  // There is an issue preventing this working.
  // See https://github.com/isaacs/node-glob/issues/335

  const {patterns, ignore} = getGlobs({dirGlobs})

  console.log({patterns, ignore})
  const dirs = glob.sync(patterns, {cwd, ignore, dot: false, cache, minimatch})
  return dirs
}

function getGlobs({dirGlobs}) {

  const patterns = [`**/@(${dirGlobs.join('|')})`]

  // Searches - all files - BAD
  // Matches - correct
  //const ignore = [`**/@(${dirGlobs.join('|')})/**/*`]

  // Searches - all files - UNUSABLE
  // Matches - none
  //const ignore = dirGlobs.map(d => `**/${d}/**`)

  // Searches - node_modules direct children - better, but still bad.
  // Matches - correct
  const ignore = dirGlobs.map(d => `**/${d}/*/**`)

  return {patterns, ignore}

}
