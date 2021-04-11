// For showing the caller location of `console.log` statements.
if (process.env.ENABLE_CONSOLE_CALLER) {
  console.log('Console calls are intercepted and will print their paths. See:', __filename)
  const stackOffset = undefined // For zog logging lib - change the value.
  require('console-caller')(global.console, stackOffset)
}

module.exports = (overrides = {}) => {
  // Needed for async/await support in Babel.
  require('regenerator-runtime')

  require('@babel/register')({
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
    // By default it seems to ignore anything outside the cwd so we override it.
    ignore: [
      'node_modules',
      // NOTE: The above ignore wasn't working for `docusaurus-plugin-live`.
      (f) => {
        return f.match('node_modules')
      },
    ],
    // --
    // TODO: This allows us to use settings from the root. But we might not want to do this because it will break module-alias perhaps.
    rootMode: 'root',
    // NOTE: We also include `babelrcRoots`
    root: getRoot(),
    // --
    // These globs indicate where babel will allow local babelrc config to be loaded from.
    babelrcRoots: [
      // When checking whether a package is inside a `babelrcRoot` the real path is used.
      // If we are symlinked, our package won't be found because it uses paths relative to `process.cwd()`.
      // So we need to tell it to search the symlinked root.
      require('path').join(getRoot(), 'repos/**'),
    ],
    ...overrides,
  })
}

function getRoot() {
  const findUp = require('find-up')
  // This should be the first file invoked by `node` process.
  // WARN: If we use a globally installed cli tool it will not find our workspace.
  // NOTE: `process.mainModule` doesn't exist if we run with `node -p "require('...')"`.
  const startSearchingFrom = process.mainModule?.filename
  const rootFile = findUp.sync('pnpm-workspace.yaml', {cwd: startSearchingFrom})
  //console.log('Using root file', rootFile)
  if (rootFile) {
    return require('path').dirname(rootFile)
  }
  return ''
}

module.exports.getRoot = getRoot
