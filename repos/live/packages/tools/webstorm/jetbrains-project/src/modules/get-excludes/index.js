import _ from 'lodash'
import findDown from '@src/modules/find-down'

export default function getExcludes({cwd, dirGlobs}) {
  dirGlobs = _.castArray(dirGlobs)
  const {excludes, notExcluded, visitedFiles, visitedDirs} = findDown({
    cwd,
    // Good for:
    // - dirs that are automatically excluded by IDE.
    // - dirs of packages that are not usually installed such as `examples`.
    ignoreGlobs: ['.git', 'examples', '__tests__', 'nuclide', 'neutrino-dev'],
    filenameGlobs: dirGlobs,
    // TODO(vjpr): Match partial paths.
    //pathGlobs: ['nuclide/pkg'],
  })
  //return {excludes, notExcluded}
  //console.log({visitedDirs, visitedFiles})
  return excludes
}
