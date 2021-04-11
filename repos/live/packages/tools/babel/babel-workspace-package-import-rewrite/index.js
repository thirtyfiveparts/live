const Debug = require('debug')
const debug = Debug('babel-workspace-package-import-rewrite')
const getWorkspacePackagesSync = require('get-workspace-pkgs-sync')
const pkgDir = require('pkg-dir')
const path = require('path')
const {join} = require('path')

// DEBUG
const logger = console.error

module.exports = function plugin(babel, {localProjectDir, projectCacheDir}) {
  const isWallabyWorkerProcess = process.argv[2] === 'worker'

  // Logging
  //const cacheLog = '/tmp/get-workspace-pkgs-cache.log'
  //require('fs').appendFileSync(
  //  cacheLog,
  //  JSON.stringify(
  //    {argv: process.argv, isWallabyWorkerProcess, pid: process.pid},
  //    null,
  //    2,
  //  ) + '\n',
  //)

  const workspacePkgs = getWorkspacePackagesSync(localProjectDir, {
    // This is not available.
    //customCacheKey: global.wallabySessionId,
    // TODO(vjpr): I'm not sure this is reliable for compilers.
    forceInvalidate: !isWallabyWorkerProcess,
    useDiskCache: true,
    cached: true,
  })
  const opts = {
    workspacePkgs,
    localProjectDir,
    projectCacheDir,
  }
  return {
    visitor: {
      ImportDeclaration: declarationHandler(babel, false, opts),
      ExportDeclaration: declarationHandler(babel, true, opts),
    },
  }
}

function declarationHandler(
  babel,
  isExport,
  {workspacePkgs, localProjectDir, projectCacheDir},
) {
  return function (nodePath, state) {
    const node = nodePath.node
    const arg = node.source

    const repoRoot = localProjectDir

    // Request must be string.
    if (!arg || arg.type !== 'StringLiteral') return

    // I.e. `import foo from '<request>'`
    const request = node.source.value

    const {filename, root, cwd} = state.file.opts

    // E.g.
    //
    // '@foo/bar/baz'
    // packageName = '@foo/bar'
    // packagePathSelector = 'baz'
    const {packageName, packagePathSelector} = parsePackageRequestString(
      request,
    )

    const pkg = workspacePkgs.find(pkg => pkg.manifest.name === packageName)

    if (!pkg) return

    // E.g.
    //
    // *packages/bar/index.js*
    //
    // import foo from '@foo/foo/index.js'
    //

    // /path/to/packages/foo
    const pkdDir = pkg.dir
    // /path/to/packages/foo -> packages/foo
    const rootRelPkgRootPath = pkdDir.replace(root + '/', '')
    // /path/to/packages/bar/index.js -> packages/bar/index.js
    const rootRelCurFile = filename.replace(root + '/', '')
    // packages/bar/index.js -> ../foo/foo
    const relPathFromCurFileToPkgRoot = path.relative(
      // packages/bar/index.js -> packages/bar (needed for path.relative to work correctly)
      path.dirname(rootRelCurFile),
      // packages/foo
      rootRelPkgRootPath,
    )
    // ../foo/foo -> ../foo/foo/index.js
    const replacement = join(relPathFromCurFileToPkgRoot, packagePathSelector)

    // ENABLE FOR LOGGING
    //logger({from: rootRelPkgRootPath, __to: rootRelCurFile, _out: replacement, full: nodePath.toString()})
    // --

    const opts = {babel, node, nodePath, replacement}

    if (isExport) {
      rewriteExport(opts)
    } else {
      rewriteImport(opts)
    }
  }
}

// Modify AST
////////////////////////////////////////////////////////////////////////////////

function rewriteImport({babel, node, nodePath, replacement}) {
  const t = babel.types
  nodePath.replaceWith(
    t.importDeclaration(node.specifiers, t.stringLiteral(replacement)),
  )
}

function rewriteExport({babel, node, nodePath, replacement}) {
  const t = babel.types
  const {declaration, specifiers} = node

  // TODO(vjpr): Use `t.isExportAllDeclaration(node, opts)`, etc.
  if (node.type === 'ExportNamedDeclaration') {
    nodePath.replaceWith(
      t.exportNamedDeclaration(
        declaration,
        specifiers,
        t.stringLiteral(replacement),
      ),
    )
  } else if (node.type === 'ExportDefaultDeclaration') {
    nodePath.replaceWith(
      t.exportDefaultDeclaration(t.stringLiteral(replacement)),
    )
  } else if (node.type === 'ExportAllDeclaration') {
    nodePath.replaceWith(
      t.exportDefaultDeclaration(t.stringLiteral(replacement)),
    )
  }
}

////////////////////////////////////////////////////////////////////////////////

// E.g.
// '@foo/bar/baz'
// packageName = '@foo/bar'
// packagePathSelector = 'baz'
function parsePackageRequestString(request) {
  const isScoped = request.charAt(0) === '@'
  const parts = request.split('/')
  const packageName = isScoped ? parts.slice(0, 2).join('/') : parts[0]
  const packagePathSelector = isScoped
    ? parts.slice(2).join('/')
    : parts.slice(1).join('/')
  return {packageName, packagePathSelector}
}

////////////////////////////////////////////////////////////////////////////////

//function fromModuleRequestToRelativeRequest() {
//
//  const currentFileCwdRelPath = filename.replace(root + '/', '')
//  //const currentFileAbsPath = join(root, currentFileCwdRelPath)
//  //const pkgRoot = pkgDir.sync(path.dirname(currentFileCwdRelPath))
//  //const pkgNodeModules = join(pkgRoot, 'node_modules')
//
//  // Example:
//  // /foo/package.json
//  // /foo/bar/baz
//  // currentFileAbsPath: /foo/bar/baz/index.js
//  // => ../../
//  const currentFileToPkgRootRelPath = path.relative(
//    path.dirname(currentFileAbsPath),
//    pkgRoot,
//  )
//
//}

//const absPath = filename.replace(root, projectCacheDir).replace('.ts', '')
//const relPath = path.relative(filename, absPath)
//const replacement = relPath
