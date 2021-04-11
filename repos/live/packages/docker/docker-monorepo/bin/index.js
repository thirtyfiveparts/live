#!/usr/bin/env node

//require('@live/cli-helper')({projectRoot: __dirname}).then(() =>
//  require('../src/index').default().then().catch(e => console.error(e))
//)

require('@live/simple-cli-helper')()
require('../src/index').default().then().catch(e => console.error(e))
