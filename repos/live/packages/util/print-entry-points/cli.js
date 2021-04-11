#!/usr/bin/env node

//require('@babel/register')
//require('./index').default().then().catch(e => {throw e.stack})

require('@live/cli-helper')({projectRoot: require('path').join(__dirname, '.')}).then(() =>
  require('./index').default({binName: 'print-entry-points'}).then().catch(e => {throw e})
)
