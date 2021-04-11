import {performance, PerformanceObserver} from 'perf_hooks'
import c from 'chalk'
import Debug from 'debug-env' // We use debug-env to avoid circular dependency if we re-used `@live/log`.
const debug = Debug('perf')

// TODO(vjpr): Maybe we should use `util.debuglog` + `NODE_DEBUG`.

let shouldPrint = true

// Disable measuring.

// Public api
export default function(label, source = {}) {
  const shouldMark = label // if exists

  const startLabel = `start-${label}`
  const endLabel = `end-${label}`
  // So we can differentiate which process it is from.
  //performance.mark(startLabel + ' ' + require.main.filename)
  // We track manually too so we can return it from this function.
  // TODO(vjpr): Maybe it impacts performance?
  const start = performance.now()
  if (shouldMark) performance.mark(startLabel)
  return () => {
    const end = performance.now()
    if (shouldMark) {
      performance.mark(endLabel)
      performance.measure(label, startLabel, endLabel)
    }
    return end - start
  }
}

////////////////////////////////////////////////////////////////////////////////

// "console.time" style api

// E.g. perf.start('foo')...perf.end('foo')

let timers = {}

export function perfStart(desc) {
  const start = performance.now()
  timers[desc] = start

  //performance.mark(`start-${desc}`)
}

export function perfEnd(desc, opts = {}) {
  const {relPath, filename, line, column} = opts
  let prettyPath = ''
  if (filename) prettyPath = `${relPath}`
  if (line) prettyPath += `:${line}:${column}`

  const start = timers[desc]
  const end = performance.now()
  const duration = end - start

  delete timers[desc]

  const descFinal = desc + ' ' + c.grey(prettyPath)

  if (shouldPrint) debug(descFinal, ms(duration))

  // TODO(vjpr): Can't do this or it prints out twice because we already print it immediately above.
  //performance.mark(`end-${desc}`)
  //performance.measure(desc, `start-${desc}`, `end-${desc}`)

  return duration
}

export function perfConfig(opts = {}) {
  // TODO(vjpr): Maybe we should allow redirection to a file.
  //   E.g. for cases when we are running shell completion.
  shouldPrint = opts.shouldPrint
}

////////////////////////////////////////////////////////////////////////////////

let measurements = []

function printMeasurementsOnProcessExit() {
  process.on('exit', () => {
    //const measurements = performance.getEntriesByType('measure') // Removed in v10.
    debug('Printing performance timings on exit')
    measurements.forEach(measurement => {
      const durationStr = ms(measurement.duration)
      debug(`${c.reset(measurement.name)} ${c.green(durationStr)}`)
    })
  })
}

printMeasurementsOnProcessExit()

export function observeMeasurements() {
  const obs = new PerformanceObserver((list, observer) => {
    measurements.push(...list.getEntries())
    list.getEntries().map(entry => {
      debug(entry.name, ms(entry.duration))
      //performance.clearMarks()
      obs.disconnect()
    })
  })
  obs.observe({entryTypes: ['measure']})
  //obs.observe({entryTypes: ['function']})
}

observeMeasurements()

////////////////////////////////////////////////////////////////////////////////

function ms(duration) {
  return Number(duration).toFixed(2) + 'ms'
}
