const debug = require('debug')('live-cli-helper')
const {spath, scode, spkg, sevt} = require('@live/log-style/es5')

module.exports = function getRoots(configGetter, configObj) {
  let config = {}

  const [repoRoot, repoRootSource] = getRepoRoot()
  const [projectRoot, projectRootSource] = getProjectRoot()

  const defaultConfig = {
    repoRoot: repoRoot,
    repoRootSource: repoRootSource,
    projectRoot: projectRoot,
    projectRootSource: projectRootSource,
  }

  if (configGetter) {
    config = configGetter(defaultConfig)
    // TODO(vjpr): Check if object.
  } else {
    // TODO(vjpr): 20180805Sun - Make sure this doesn't break out app.
    config = defaultConfig
  }

  if (configObj.projectRoot) {
    config.projectRoot = configObj.projectRoot
    config.projectRootSource = 'programmatic args'
  }

  if (!config.projectRoot) {
    throw new Error('You must specify a project root.')
  }

  debug(
    `Setting global repo root to ${spath(config.repoRoot)} (from ${spath(
      config.repoRootSource,
    )})`,
  )
  debug(
    `Setting global project root to ${spath(config.projectRoot)} (from ${spath(
      config.projectRootSource,
    )})`,
  )

  return config
}

/* A monorepo can contain many projects (or apps). You can run a tool on a specific project. You can `require('~')` to get the project root. This is handy for configuration. However, because its done by babel transpilation, we need to set this up ASAP, because once someone requires something, its too late. */
function getProjectRoot() {
  let p
  if ((p = process.env.LIVE_CLI_PROJECT_ROOT)) {
    return [p, 'process.env.LIVE_CLI_PROJECT_ROOT']
  }
  return []
}

function getRepoRoot() {
  let p
  if ((p = process.env.LIVE_CLI_REPO_ROOT)) {
    return [p, 'process.env.LIVE_CLI_REPO_ROOT']
  }

  // TODO(vjpr): Find up.

  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  if (rootPath) {
    return [path.dirname(rootPath), 'find-up']
  }

  if (!p) {
    //  throw new Error('No repo root found.')
  }

  return [process.cwd(), 'default']
}
