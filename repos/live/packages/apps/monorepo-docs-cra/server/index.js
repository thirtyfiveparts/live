//async function main() {
//  ////////////////////
//  const findUp = require('find-up')
//  const path = require('path')
//  const rootPath = path.dirname(findUp.sync('.monoroot', {cwd: process.cwd()}))
//  process.env.LIVE_CLI_REPO_ROOT = rootPath
//  ////////////////////
//
//  return require('@live/cli-helper')({projectRoot: process.cwd()}).then(
//    () =>
//      // Babel is now available to use!
//
//      // Place remaining init functions inside this file because you can use `import` inside
//      require('./server'),
//  )
//}
//
//main().then()

require('@live/simple-cli-helper')
require('./src/index').default().then()


