#!/usr/bin/env node

require('@live/simple-cli-helper')()
require('../src/cli.ts').cli().then().catch(e => console.error(e))

////////////////////////////////////////////////////////////////////////////////

//
//require('@live/cli-helper')({projectRoot: require('path').join(__dirname, '..')}).then(() =>
//  require('../src/index').default({binName: 'live-init-cli'}).then().catch(e => {throw e})
//)
