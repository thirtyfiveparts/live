#!/usr/bin/env node

require('@live/simple-cli-helper')()
require('../src/cli').cli().then().catch(e => console.error(e))
