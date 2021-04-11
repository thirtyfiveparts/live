#!/usr/bin/env node

require('@live/cli-helper')({projectRoot: __dirname}).then(() =>
  require('../src/cli').default().then().catch(e => console.error(e))
)
