#!/usr/bin/env node

global.origProcessEnv = Object.assign({}, process.env)

require('@live/cli-helper/console-caller.es5.js')()

// Enable this to print out require times.
//require('../lib/modules/perf/time-requires')

// PERF: This may slow things down. Lots of file reads when TRANSPILE_CHECKER=1 is enabled.
require('@live/cli-helper/transpile-checker.es5.js').default()

const {perf} = require('@live/log/es5')

let perfEnd = perf('init @babel/polyfill')
require('@babel/polyfill')
perfEnd()

require('source-map-support').install({
  environment: 'node',
})
require('../lib/index').default().then().catch(e => {throw e})
