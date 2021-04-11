import c from 'chalk'
import _ from 'lodash'
import sqlFormatter from 'sql-formatter'

global.pauseSQLLogging = false

export default function logger(a, time) {
  if (global.pauseSQLLogging) return
  if (a.startsWith('Executed') || a.startsWith('Executing')) {
    // Query.
    console.log(c.gray(sqlFormatter.format(a)))
    console.log(_.times(80, () => '-').join(''))
  } else {
    console.log(a)
  }
}
