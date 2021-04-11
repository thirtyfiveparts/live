#!/usr/bin/env node

printVersion()
babelRegister()
require('./src/cli').default().then()

function printVersion() {
  const pjson = require('./package.json')
  console.log('Version:', pjson.version)
}

function babelRegister() {
  const pjson = require('./package.json')
  // https://github.com/babel/babel-loader/issues/299#issuecomment-259713477
  const babelConfig = pjson.babel
  // When pnpm installs this, it is nested in a `node_modules` folder which seems to ignore processing it.
  babelConfig.only = /jetbrains\-project\/src/
  // babelConfig.presets = require.resolve('babel-preset-es2015')
  //console.log(babelConfig)
  require('babel-register')(babelConfig)
}
