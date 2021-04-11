// Waiting for: https://github.com/pnpm/pnpm/issues/3000

const shouldLog = true
const cacheLog = '/tmp/get-workspace-pkgs-cache.log'

let pkgsJson = null
function getWorkspacePackagesSync(cwd, opts) {
  const fn = 'getWorkspacePackages'
  // `cached` here means in-memory cache for this process.
  const {cached, customCacheKey, useDiskCache} = opts ?? {}
  if (cached && pkgsJson) {
    if (shouldLog)
      fse.appendFileSync(cacheLog, 'memory cache hit\n' + fn + '\n\n')
    return pkgsJson
  }
  if (shouldLog)
    fse.appendFileSync(cacheLog, 'memory cache miss\n' + fn + '\n\n')
  cwd = cwd ?? process.cwd()
  const args = [cwd]
  pkgsJson = execScript({
    fn,
    args,
    ...opts,
  })
  return pkgsJson
}

function getTransitiveDependenciesSync(cwd, filter, pkgName, parentDir, opts) {
  const {customCacheKey, useDiskCache} = opts ?? {}
  cwd = cwd ?? process.cwd()
  const fn = 'getTransitiveDependencies'
  const args = [cwd, filter, pkgName, parentDir]
  return execScript({fn, args, ...opts})
}

module.exports = getWorkspacePackagesSync
module.exports.getWorkspacePackagesSync = getWorkspacePackagesSync
module.exports.getTransitiveDependenciesSync = getTransitiveDependenciesSync

////////////////////////////////////////////////////////////////////////////////

// Runs a script and parses the json response.
function execScript(opts) {
  const {fn, args, customCacheKey, useDiskCache, forceInvalidate} = opts ?? {}

  if (useDiskCache) {
    // TODO(vjpr): Must stabilize cache key.
    const stableCacheKey = {fn, args, customCacheKey}
    // --
    const cacheKey = JSON.stringify(stableCacheKey, null, 0)
    return cache(cacheKey, forceInvalidate, run)
  } else {
    return run()
  }

  function run() {
    // TODO(vjpr): Check that this is not called multiple times.
    const {execSync} = require('child_process')
    const path = require('path')
    const scriptPath = path.join(__dirname, 'api/entry.js')
    // Wrap each arg in quotes.
    // Serialize args as json.
    const argJson = {fn, args}
    const argBase64 = Buffer.from(JSON.stringify(argJson)).toString('base64')
    const cmd = `node ${scriptPath} ${argBase64}`
    const out = execSync(cmd).toString()
    return JSON.parse(out)
  }
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Handle race conditions? 10 workers trying to access this file at once.

const fse = require('fs-extra')
const cacheFile = '/tmp/get-workspace-pkgs-cache.json'
function cache(cacheKey, forceInvalidate, fn) {
  const cache = fse.readJsonSync(cacheFile, {throws: false}) ?? {}
  // TODO(vjpr): This may grow quite large.
  const cached = cache[cacheKey]
  if (shouldLog) fse.ensureFileSync(cacheLog)
  if (cached && !forceInvalidate) {
    if (shouldLog) fse.appendFileSync(cacheLog, `cache hit\n${cacheKey}\n\n`)
    return cached
  }
  if (shouldLog)
    fse.appendFileSync(
      cacheLog,
      `cache miss\n${cacheKey}\nforceInvalidate=${forceInvalidate}\n\n`,
    )
  const result = fn()
  cache[cacheKey] = result
  //fse.ensureFileSync(cacheFile)
  fse.outputJsonSync(cacheFile, cache, {spaces: 2})
  return result
}
