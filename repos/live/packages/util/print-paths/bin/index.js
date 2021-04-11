#!/usr/bin/env node

//require('@babel/register')
//require('./index').default().then().catch(e => {throw e.stack})

// prettier-ignore
require('@live/cli-helper')({projectRoot: require('path').join(__dirname, '..')}).then(() =>
  require('../src/index').default({binName: 'pretty-print'}).then().catch(e => {throw e})
)
