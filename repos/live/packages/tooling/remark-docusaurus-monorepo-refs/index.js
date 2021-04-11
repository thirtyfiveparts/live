var visit = require('unist-util-visit')
var toString = require('mdast-util-to-string')
const findUp = require('find-up')
const path = require('path')

const repoRoot = path.dirname(findUp.sync('pnpm-workspace.yaml'))
const findWorkspacePackagesSync = require('get-workspace-pkgs-sync')

// Get all workspace packages in monorepo.
const pkgs = findWorkspacePackagesSync(process.cwd(), {cached: true})

// Filter packages that have Docusaurus docs.
let docusaurusPkgs = pkgs.filter(p => p.manifest.live?.docusaurus?.enable)

// Obtain the docusaurus plugin id (which becomes the slug of the plugin root)
//   using the same recipe as is used to create it when configuring the plugin.
docusaurusPkgs.map(pkg => {
  pkg.docusaurusId = idFromPackageName(pkg.manifest.name)
})

// Convert references to Docusaurus URLs/slugs.
module.exports = opts => {
  // DEBUG
  //console.log(JSON.stringify(docusaurusPkgs, null, 2))

  return transform

  function transform(tree, vfile) {
    // Get the filename of the current file being processed.
    const filename = vfile.history[0]

    // Assign a visitor function for every markdown link found. I.e. `[foo](/foo)`.
    visit(tree, 'link', visitor)

    function visitor(node) {
      // a. URLs.

      if (node.url.match(/^https?:\/\//i)) return

      // b. Abs paths.

      if (node.url.startsWith('/')) {
        // `docusaurus-plugin-docs` may have already transformed this relative url into a root url.
        const rootUrlExists = docusaurusPkgs.find(pkg => {
          return node.url.startsWith('/' + pkg.docusaurusId)
        })
        if (rootUrlExists) return

        // Otherwise, resolve to repo root.
        // TODO(vjpr): Will this work? I think we need to double-check the ordering or this remark plugin and when docusaurus runs.
        const absDiskPath = path.join(repoRoot, node.url)
        processAbsDiskPath({node, absDiskPath})
        return
      }

      // c. Rel paths.

      if (node.url.startsWith('./')) {
        return
      }

      // d. Other paths.
      // Resolve relative to file.

      // Get absolute path on disk.
      const absDiskPath = path.resolve(path.dirname(filename), node.url)

      processAbsDiskPath({node, absDiskPath})

      //
    }
  }
}

function processAbsDiskPath({node, absDiskPath}) {

  // We must avoid nested docs paths.

  // Find all packages with roots that contain this absolute disk path.
  const dps = docusaurusPkgs.filter(pkg => absDiskPath.startsWith(pkg.dir))
  // We choose the longest path.
  const docsRoot = pkgWithLongestDir(dps)

  // --

  // Replace path with repo root relative path.
  const docsRootFolder =
    docsRoot.manifest.live?.docusaurus?.docs?.folder ?? ''

  const pathWithDocsFolder = path.join(docsRoot.dir, docsRootFolder)

  // If we link to a file that is not in a docusaurus root, we throw an error.
  if (!absDiskPath.startsWith(pathWithDocsFolder)) {
    const msg = `
      You have markdown reference linking to a file that is not within a docusaurus root.
      Target file: '${absDiskPath}'
      Target closest pjson: '${docsRoot.dir}/package.json'
      Target closest docs root: '${pathWithDocsFolder}' <- Make sure your file is within here.
        This is set within 'package.json#live.docusaurus.docs.folder'.
    `
    console.warn(msg)
  }

  node.url = path.join(
    '/' + docsRoot.docusaurusId,
    absDiskPath.replace(pathWithDocsFolder, '').replace(/.mdx?/, ''),
  )

}

////////////////////////////////////////////////////////////////////////////////

function idFromPackageName(pkgName) {
  // @live/foo-bar.baz => live_foo_bar__baz
  return pkgName
    .replace('@', '')
    .replace(/-/g, '_')
    .replace('/', '_')
    .replace(/\./g, '__')
}

////////////////////////////////////////////////////////////////////////////////

var pkgWithLongestDir = arr =>
  arr.reduce(function (a, b) {
    return a.dir.length > b.dir.length ? a : b
  })
