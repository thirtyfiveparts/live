#!/usr/bin/env node

require('@babel/polyfill')

// PERF: This may slow things down. Lots of file reads when TRANSPILE_CHECKER=1 is enabled.
require('@live/cli-helper/transpile-checker.es5.js').default()

require('../lib/index').default({binName: 'lives'}).then().catch(e => {throw e})
