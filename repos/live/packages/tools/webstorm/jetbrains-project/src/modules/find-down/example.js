import findDownShallow from './index'

// Files to exclude.

//const list = findDown({
//  dir: '/Users/Vaughan/dev-live',
//  found: [],
//  // Good for:
//  // - dirs that are automatically excluded by IDE.
//  // - dirs of packages that are not usually installed such as `examples`.
//  ignoreGlobs: ['.git', 'examples', '__tests__'],
//  filenameGlobs: ['node_modules', 'lib', 'build', '.next'],
//  // TODO(vjpr): Match partial paths.
//  //pathGlobs: ['nuclide/pkg'],
//})
//console.log({list})

////////////////////////////////////////////////////////////////////////////////

// Files to initially watch

let notExcludedDirs = []

const list = findDownShallow({
  dir: '/Users/Vaughan/dev-live',
  found: [],
  notExcluded: notExcludedDirs,
  // Good for:
  // - dirs that are automatically excluded by IDE.
  // - dirs of packages that are not usually installed such as `examples`.
  ignoreGlobs: ['.git', 'examples', '__tests__'],
  filenameGlobs: ['node_modules', 'lib', 'build', '.next'],
  // TODO(vjpr): Match partial paths.
  //pathGlobs: ['nuclide/pkg'],
})
console.log({notExcludedDirs})
