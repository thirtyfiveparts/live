const debug = require('debug')('live-cli-helper')
const {spath, scode, spkg, sevt} = require('@live/log-style/es5')

const {getDefaultBabelConfig, getFinalBabelIgnores} = require('./default-babel-config')
const saveBabelCacheOnExit = require('./save-cache-on-exit')

exports.setupBabelRegister = (babelConfig, appRoot) => {

  const cachePath = getBabelCachePath(appRoot)
  setBabelCachePath(cachePath)

  // Enable this if you want to disable babel cache. It just sets an env var.
  // TODO(vjpr): Should we disable cache during test?
  //disableBabelCache()

  printBabelConfig(babelConfig, cachePath)

  debug(scode(`require('@babel/register')`))
  // PERF: This is expensive. Takes about 400ms.
  const babelRegister = require('@babel/register')
  // TODO(vjpr): Try using new {rootMode: upwards}. See https://babeljs.io/docs/en/config-files#root-babelconfigjs-files
  //const babelRegister = require('@babel/register')({rootMode: 'upwards'})
  // --
  babelRegister(babelConfig)

  // TODO(vjpr): Is there a builtin way to do this?
  // We use this to prevent re-requiring babel for reading livefiles in @live/cli.
  global.__babelRegisterRequired__ = true

  saveBabelCacheOnExit()

  // TODO(vjpr): Add logging to babel/cache. Need to fork it.
  //   This can be a big slow down.
  //   Also, the cache can be massive with the keys.

}

exports.getBabelConfig = (babelConfigGetter, {repoRoot, packageRoots}) => {
  const config = babelConfigGetter
    ? babelConfigGetter(getDefaultBabelConfig({repoRoot}))
    : getDefaultBabelConfig({repoRoot})
  // TODO(vjpr): Make this customizable...pass to getter.
  //   Maybe ignores should have "stages". E.g. normal, logging, slow10, slow20.
  //   So that you can see the others, and insert your own priority easily using dewy decimal-like approach.
  config.ignore.push(...getFinalBabelIgnores(packageRoots))
  return config
}

function printBabelConfig(config, cachePath) {
  debug('Using babel config:', config)
  debug('with cache path:', cachePath)
}

// TODO(vjpr): Should this be configurable?
function getBabelCachePath(appRoot) {
  // This is how its done in @babel/register:
  //const babel = require('@babel/core')
  //const cachePath = require('path').join(appRoot, `.babel.${babel.version}.${babel.getEnv()}.json`)
  const cachePath = require('path').join(appRoot, 'tmp/babel-register-cache')
  return cachePath
}

function setBabelCachePath(cachePath) {
  // TODO(vjpr): Or should we share the cache?
  //   This means we don't blow away the cache for other apps - probably good thing.
  process.env.BABEL_CACHE_PATH = process.env.BABEL_CACHE_PATH || cachePath
}

// NOTE: `process.env.BABEL_DISABLE_CACHE` disables cache but does not clear it.
function disableBabelCache() {
  process.env.BABEL_DISABLE_CACHE = true
}
