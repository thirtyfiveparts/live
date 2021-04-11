////////////////////////////////////////////////////////////////////////////////

// Older imperative approach.
//// TODO(vjpr): Use rxjs and takeWhile.
//let firstHeading
//let middleChildren = []
//let secondHeading
//for (const child of root.children) {
//  if (secondHeading) continue // early exit
//  if (child.type === 'heading') {
//    if (!firstHeading) {
//      firstHeading = child
//      continue
//    }
//    if (!secondHeading) {
//      secondHeading = child
//    }
//    continue
//  }
//  middleChildren.push(child)
//}
//
//
//const out = toMarkdown(block)
//
//return {desc: out, frontmatter}
