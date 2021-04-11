#!/usr/bin/env node

//require('console-caller')(global.console, undefined)

require('@live/simple-cli-helper')()
require('../src/index').default({binName: 'live-monorepo-cli'}).then().catch(e => {console.error(e)})
