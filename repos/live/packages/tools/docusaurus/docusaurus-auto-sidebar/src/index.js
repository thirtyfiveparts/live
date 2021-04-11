const dirTree = require('directory-tree')
const matter = require('gray-matter')
const fs = require('fs')
const changeCase = require('change-case')

const debug = false

function getLastPathPart(p) {
  return p.substring(p.lastIndexOf('/') + 1)
}

module.exports = function (docsDir, overrides = [], excludes = []) {
  if (debug) console.log('----------')

  docsDir = require('path').resolve(docsDir)

  const filteredTree = dirTree(docsDir, {
    extensions: /\.(md|mdx)$/,
    // TODO(vjpr): Sync with `docusaurus-preset-monorepo-docs`.
    //   Read from package.json#live.docusaurus.exclude. We should use exclude instead of include.
    exclude: [/node_modules/, /Carthage/, ...excludes],
  })

  const sidebarTree = treeToDocuSidebarTreeShorthand(filteredTree)

  // See: https://v2.docusaurus.io/docs/sidebar#creating-a-hierachy
  function treeToDocuSidebarTreeShorthand(node) {
    if (!node) return

    // File (leaf)
    if (node.type === 'file') {
      const id = getDocumentIdFromPath(node, docsDir)

      // TODO(vjpr): We skip ids starting with dots because Docusaurus doesn't support them right now.
      if (id.startsWith('.')) return

      return {
        type: 'doc',
        id,
      }
    }

    // Directory
    if (node.type === 'directory') {
      const out = {
        type: 'category',
        label: changeCase.sentenceCase(node.name),
        items: node.children
          .map(child => treeToDocuSidebarTreeShorthand(child))
          .filter(Boolean), // Filter trees with no markdown files.
      }
      if (out.items.length) return out
      return
    }
  }

  const sidebarTreeItems = sidebarTree?.items ?? []

  // We use `.items` because the first dir is the docs dir which whose level we don't want to show.
  const out = [...sidebarTreeItems, ...overrides]

  if (debug) console.log(JSON.stringify(out, null, 2))

  return out
}

////////////////////////////////////////////////////////////////////////////////

function getDocumentIdFromPath(node, docsDir) {
  // Docusaurus automatically generates document ids based on file path.
  // See: https://v2.docusaurus.io/docs/docs-introduction#document-id

  // However, the last part of the `id` can be modified in the frontmatter.
  //   We must use this if it exists.
  const fm = matter(fs.readFileSync(node.path))
  let id = fm.data.id

  if (id) {
    // Replace final part of path with our custom id.
    id = node.path.split('/').slice(0, -1).join('/') + '/' + id
  } else {
    id = trimFileExtension(node.path)
  }

  id = id.replace(docsDir + '/', '')
  return id
}

////////////////////////////////////////////////////////////////////////////////

//const glob = require('globby')
//const flat = require('flat')
//const files = glob.sync('**/*.md', {cwd: docsDir, onlyFiles: false})
//const config = flat.unflatten({files}, {delimiter: '/'})

function trimFileExtension(foo) {
  return foo.split('.').slice(0, -1).join('.')
}
