var has = require('hast-util-has-property')
var headingRank = require('hast-util-heading-rank')
var toString = require('hast-util-to-string')
var visit = require('unist-util-visit')

module.exports = function () {
  return transformer
}

function transformer(tree, vfile) {
  if (process.env.NODE_ENV === 'production') return
  visit(tree, 'element', node => {
    // NOTE: We wrap in try/catch because stack traces are not thrown correctly in Docusaurus.
    tryCatch(() => visitor(node))
  })
  function visitor(node) {
    // Is a heading.
    if (headingRank(node)) {
      // TODO(vjpr): `react-admonitions` don't seem to have
      if (!node.position) return
      // TODO(vjpr): The line and col don't take into account the frontmatter. It must be trimmed earlier in the chain.
      // See: https://mdxjs.com/guides/custom-loader#custom-loader
      const line = node.position.start.line
      const col = node.position.start.column
      node.properties['data-qa-file'] = getFilePath(vfile.history[0], line, col)
    }
  }
}

////////////////////////////////////////////////////////////////////////////////

function getFilePath(f, l, c) {
  return f + `:${l}:${c}`
}

function tryCatch(fn) {
  try {
    fn()
  } catch (e) {
    console.error(e)
  }
}
