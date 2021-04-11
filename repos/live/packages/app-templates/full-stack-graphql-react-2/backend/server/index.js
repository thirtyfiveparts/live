#!/usr/bin/env node

require('@live/simple-cli-helper')()
require('./src/main.ts').default().then().catch(e => console.error(e))
