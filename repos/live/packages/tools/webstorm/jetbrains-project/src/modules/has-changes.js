import * as jsdiff from 'diff'
import _ from 'lodash'

export default function hasChanges(a, b) {
  a = a || ''
  b = b || ''
  const diff = jsdiff.diffLines(a, b)
  return _(diff).some(part => part.added || part.removed)
}
