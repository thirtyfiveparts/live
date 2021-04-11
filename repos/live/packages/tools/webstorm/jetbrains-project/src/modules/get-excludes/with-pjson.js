import _ from 'lodash'
import glob from 'globby'
import path, {join} from 'path'
import fs from 'fs'

import minimatch from 'minimatch'

// Find all `package.json` files. Exclude files next to them.
export default function getExcludes({dirGlobs, cwd, cache}) {
  dirGlobs = _.castArray(dirGlobs)
  const {patterns, ignore} = getGlobs({dirGlobs})
  const pjsonFiles = glob.sync(patterns, {
    cwd,
    ignore,
    dot: false,
    cache,
    minimatch,
    absolute: false,
  })
  let out = []
  for (const pjsonFile of pjsonFiles) {
    const dir = path.dirname(pjsonFile)
    const absDir = join(cwd, dir)
    const files = fs.readdirSync(absDir)
    let matches = _.intersection(files, dirGlobs)
    matches = matches.map(f => join(dir, f))
    out.push(...matches)
  }
  return out
}

function getGlobs({dirGlobs}) {
  // This is bad because we want to stop search when we find a `package.json` file.
  //   This does into all nested folders.
  return {patterns: '**/package.json', ignore: '**/node_modules/**'}
}
