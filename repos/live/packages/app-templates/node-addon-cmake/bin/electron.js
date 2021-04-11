#!/usr/bin/env node

require('@live/simple-cli-helper')()
require('../example/electron/index.ts').default().then().catch(e => console.error(e))
