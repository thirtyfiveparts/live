#!/usr/bin/env node

// This is for running @live/cli with @babel/register.

// PERF: This may slow things down. Lots of file reads when TRANSPILE_CHECKER=1 is enabled.
require('@live/cli-helper/transpile-checker.es5.js').default()

////////////////////////////////////////////////////////////////////////////////

const {performance, PerformanceObserver} = require('perf_hooks')
const timeEnd = time()
performance.mark('first-line')

const useRequireClock = false
let requireClock = null
if (useRequireClock) {
  requireClock = require('/Users/Vaughan/dev-projects/+require-tools/packages/require-clock').default()
  requireClock.start()
}
performance.mark('require-clock')

////////////////////////////////////////////////////////////////////////////////

//require('@babel/polyfill')

// Just regenerator-runtime is more lightweight.
global.regeneratorRuntime = require('regenerator-runtime')

////////////////////////////////////////////////////////////////////////////////

performance.mark('regenerator-runtime')

require('../lib/index')
  .default({binName: 'live'})
  .then(() => {
    requireClock && requireClock.end()
    timeEnd()
  })
  .catch(e => {
    throw e
  })

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Maybe we could just use this module. Its pretty lightweight.
//const {perf} = require('@live/log/es5')

function time() {
  // TODO(vjpr): Maybe use a PerformanceObserver.
  return () => {
    const util = require('util')
    const debug = util.debuglog('perf')
    performance.mark('cli-started')
    performance.measure('step: first-line', null, 'first-line')
    performance.measure(
      'step: regenerator-runtime',
      'require-clock',
      'regenerator-runtime',
    )
    performance.measure('step: require-clock', 'first-line', 'require-clock')
    performance.measure('cli-started', null, 'cli-started')

    // TODO(vjpr): Removed in v10.
    //const measurements = performance.getEntriesByType('measure')
    const measurements = getEntriesByType('measure')
    measurements.forEach(measurement => {
      debug(
        '\x1b[32m%s\x1b[0m',
        Number(measurement.duration).toFixed(2) + 'ms ' + measurement.name,
      )
    })
  }
}

function pad(num, size) {
  return ('000000000' + num).substr(-size)
}

////////////////////////////////////////////////////////////////////////////////

const measures = []
const obs = new PerformanceObserver(list => {
  measures.push(...list.getEntries())
  obs.disconnect()
})
obs.observe({entryTypes: ['measure']})
function getEntriesByType(name) {
  return measures
}
