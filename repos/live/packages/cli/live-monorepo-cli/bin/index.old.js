#!/usr/bin/env node

require('@live/cli-helper')({projectRoot: require('path').join(__dirname, '..')}).then(() =>
  require('../src/index').default({binName: 'live-monorepo-cli'}).then().catch(e => {throw e})
)
