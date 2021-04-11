#!/usr/bin/env node

// Just for quick testing.

require('@live/cli-helper')({projectRoot: require('path').join(__dirname, '..')}).then(() =>
  require('../src/index').default({binName: 'lives'}).then().catch(e => {throw e})
)
