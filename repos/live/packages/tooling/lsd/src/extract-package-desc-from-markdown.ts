//import toString from 'mdast-util-to-string'
import unified from 'unified'
import parse from 'remark-parse'
import visit from 'unist-util-visit'
//import stringify from 'unist-util-stringify'
import toMarkdown from 'mdast-util-to-markdown'
import fromMarkdown from 'mdast-util-from-markdown'
import {from} from 'rxjs'
import {skipWhile, takeWhile, toArray} from 'rxjs/operators'

export default async function extractPackageDescFromMarkdown(contents) {
  const root = fromMarkdown(contents)

  const nodes = await getDescription(root)
  const block = {
    type: 'root',
    children: nodes,
  }
  return {desc: toMarkdown(block).trim()}

}

function getLinks(root) {
  const linkStrs = []
  visit(root, 'heading', node => {
    if (node.depth === 2 && node.value === 'Links') {
      visit(node, 'listItem', node => {
        node.push
      })
    }
  })

}

async function getDescription(root) {
  // Get nodes between first and second heading.
  return from(root.children)
    .pipe(
      skipWhile(n => n.type === 'heading'),
      // Or is empty line?
      takeWhile(n => n.type !== 'heading'),
      toArray(),
    )
    .toPromise()
}

