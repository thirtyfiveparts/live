import {spawn, exec} from 'promisify-child-process'
import TableParser from 'table-parser'
import os from 'os'

import moment from 'moment'
import 'moment-strftime'

// TODO(vjpr): We started working on this because we need the start time of the process to use as a unique id.

// https://apple.stackexchange.com/questions/272849/what-is-the-modern-equivalent-of-ps-aux-on-macos-sierra

// Man page for `ps`.
// https://gist.github.com/jhyland87/6ff0266abc9a9b57690ab28dfc18c180

// https://unix.stackexchange.com/questions/401785/ps-output-with-iso-date-format

export default async function ps() {
  const cmd = 'ps'
  //const args = ['aux']
  //const args = ['-Ao', 'user,pid,stat,lstart,time,command']
  //const args = ['aux', '-eo', 'pid,lstart,cmd']
  //const args = ['-p', 'lstart']

  // 90548 Sat  3 Aug 19:53:16 2019     /Users/Vaughan/nvm/versions/node/v12.4.0/bin/node /Users/Vaughan/nvm/versions/node/v12.4.0/bin/../pnpm-global/2/node_modules/nodemo

  // WARNING: lstart can change from NTP time updates
  //   See: https://unix.stackexchange.com/questions/274610/output-of-ps-lstart-changed

  // WARNING: command can be changed by the process using `setproctitle`. Don't rely on this for anything.

  // NOTE: > When output is not to a terminal, an unlimited number of columns are always used.`
  //   https://gist.github.com/jhyland87/6ff0266abc9a9b57690ab28dfc18c180#file-ps-txt-L129
  const args = ['-a', '-o', 'pid,lstart,command']

  const {stdout, stderr} = await spawn(cmd, args, {
    encoding: 'utf8',
    maxBuffer: 400000,
    // We must pass `process.env` in order to use the same locale as our terminal
    //   so that the `lstart` date format will be consistent.
    env: {...process.env, LANG: undefined},
  })

  //const lines = stdout.split('\n')
  //lines.map(l => console.log(l))

  //let out2 = tableParser(stdout)
  //console.log(out2)

  let out = TableParser.parse(stdout)
  out = out.map(p => {
    const pid = parseInt(p.PID[0])

    // lstart
    // ---------------------

    // > The exact time the command started, using the `%c' format described in strftime(3).
    //   https://gist.github.com/jhyland87/6ff0266abc9a9b57690ab28dfc18c180#file-ps-txt-L187
    // Looks like RFC 2822 but year is on the end strangely.
    const startedStr = p.STARTED.join(' ')
    const started = parseStrftimeFormatPercentageC(startedStr)

    // ---------------------

    // Elapsed running time.
    // Could do elapsed time minus current system time to get an accurate time that is unaffected by NTP updates.
    //const etimes = p.ELAPSED
    const [_, ...cmd] = p.COMMAND
    const cmdStr = cmd.join(' ')

    return {pid, startedStr, started, cmd, cmdStr}
  })
  return out
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Region effects ordering! FUCK!
function parseStrftimeFormatPercentageC(d) {

  // The formats varied because we were not passing in `process.env` to our `ps` call which prevented the correct locale being used.
  //
  // Input format:
  //
  // (EU locale)
  // Wed 31 Jul 21:43:54 2019
  // Sat  3 Aug 01:12:33 2019
  //
  // (US locale)
  // Sun Jan 17 15:03:58 2021
  //
  // We receive it split into an array and then joined so this right-aligned
  //   day-of-month doesn't matter.

  // TODO(vjpr): Region affects the ordering :(.
  let format
  const match = d.match(/[a-zA-Z]{3} \d+/)
  if (match) {
    format = 'ddd D MMM HH:mm:ss YYYY'
  } else {
    format = 'ddd MMM D HH:mm:ss YYYY'
  }

  // We must use `.utc` or otherwise `.toDate()` adjusts to our timezone (I think).
  //   20210128Thu: I think this was a comment before we realized that the lstart locale was different.
  const out = moment(d, format)
  return out.toDate()
}

//function tableParser(output, options) {
//  options = options || {}
//  var separator = options.separator || ' '
//  var lines = output.split('\n')
//
//  if (options.skipLines > 0) {
//    lines.splice(0, options.skipLines)
//  }
//
//  var headers = lines.shift()
//  var splitHeader = headers.split(separator)
//
//  var limits = []
//
//  for (var i = 0; i < splitHeader.length; i++) {
//    var colName = splitHeader[i].trim()
//
//    if (colName !== '') {
//      limits.push({label: colName, start: headers.indexOf(colName)})
//    }
//  }
//
//  var table = lines.map(function(line) {
//    if (line) {
//      var result = {}
//
//      for (var key in limits) {
//        var header = limits[key]
//        var nextKey = parseInt(key, 10) + 1
//        var start = key === '0' ? 0 : header.start
//        var end = limits[nextKey] ? limits[nextKey].start - start : undefined
//
//        result[header.label] = line.substr(start, end).trim()
//      }
//
//      return result
//    }
//  })
//
//  table[table.length - 1] === undefined && table.pop()
//
//  return table
//}
