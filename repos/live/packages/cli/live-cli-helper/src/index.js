const traceConsoleLogCalls = require('./trace-console-log-calls')
traceConsoleLogCalls()
const {perf, updateLoggerEnv} = require('@live/log/es5')
perf.start('live-cli-helper initial requires')
require('./transpile-status-checker').default()
require('v8-compile-cache')
const debug = require('debug')('live-cli-helper')
const {spath, scode, spkg, sevt} = require('@live/log-style/es5')
const getRoots = require('./get-roots')
const {getBabelConfig, setupBabelRegister} = require('./babel')
const setupPromiseRejectionHandler = require('./promise-rejection-handler')
const useSameBabelCore = require('./babel/use-same-babel-core')
const loadEnvironmentVars = require('@live/load-env').default // You need to transpile this if you are modifying it.
const {join} = require('path')
perf.end('live-cli-helper initial requires')
// End: ~100ms (20190124Thu)

const isWallaby = process.env.WALLABY

module.exports = async ({projectRoot, configGetter, babelConfigGetter} = {}) => {
  const cwd = process.cwd()

  ////////////////////

  // TODO(vjpr): Maybe make this a sync function - might be faster.
  // TODO: This used to be at the bottom...check that nothing breaks.
  await loadEnvironmentVars()

  // Needs to be after `loadEnvironmentVars`, in case we enable it from `.env` file.
  traceConsoleLogCalls()

  updateLoggerEnv(process.env.DEBUG)

  ////////////////////

  debug(`Started ${spkg('live-cli-helper')} in ${spath(cwd)}`)

  //process.on('SIGINT', function () {
  //  console.log('@live/cli-helper received SIGINT')
  //  process.exit()
  //})

  // TODO(vjpr)
  //require('./error-handling')()

  setupPromiseRejectionHandler()

  const config = getRoots(configGetter, {projectRoot})

  setProjectRoot({projectRoot: config.projectRoot})

  const appRoot = require('@live/app-root')

  // Careful - live.config.js is being loaded before babel-register is set.
  const liveConfig = require(join(config.repoRoot, 'live.config.js'))

  const packageRoots = liveConfig.repoFolders || ['packages/public-symlink']

  const babelConfig = getBabelConfig(babelConfigGetter, {
    repoRoot: config.repoRoot,
    packageRoots,
  })

  if (!isWallaby) {
    setupBabelRegister(babelConfig, config.projectRoot)
  }

  // Babel is now available to use!

  // TODO(vjpr): Add a require hack for deduping.

  // TODO(vjpr): Can we move this up? Does it even work?
  setupSourceMapSupport()

  useSameBabelCore({repoRoot: config.repoRoot})
}

function setProjectRoot({projectRoot}) {
  global.__liveAppRoot__ = projectRoot
}

function setupSourceMapSupport() {
  require('source-map-support').install({
    environment: 'node',
  })
}
