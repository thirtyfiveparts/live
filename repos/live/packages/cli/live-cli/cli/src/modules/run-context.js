import runShell from './runners/project-shell-cmd'
import _ from 'lodash'
import Debug from 'debug'

import path, {join} from 'path'
const debug = Debug('@live/cli:run-context')
import runRepoBin from './runners/repo-bin'
import makeRunPkgScript from './runners/repo-pkg-script'
import makeNode from './runners/node'

// Run context is passed to the livefile which can then use it
//   to run commands how they like.
export default function getContext({repoRoot, projectRoot, cwd, config}) {
  const run = makeRun({repoRoot, projectRoot, cwd, config})
  const help = (fn, desc) => {
    fn.desc = desc
    return fn
  }
  const node = makeNode({run, repoRoot, projectRoot, config})
  const nodeApp = async function(...args) {
    // TODO(vjpr): We must run with cwd as root, because we have some incorrect
    //   usages of process.cwd lying about.
    // TODO(vjpr): We should look into `package.json`.
    const appEntryPoint = join(projectRoot, 'index.js')
    await node(appEntryPoint, ...args)
  }

  // Convenience to run a bin from a package in this monorepo, in this app's root.
  // E.g. In `@live/db` run bin `recreate`.
  const repoPkgBin = async function(pkg, bin, ...args) {
    console.log('Running a repo bin', pkg)

    await runRepoBin({config, cwd, bin, repoRoot, ...args})
  }

  const repoPkgScriptRunner = makeRunPkgScript({repoRoot, projectRoot, config, cwd})
  // Run a script identified by module request path.
  // E.g. `@live/db/scripts/recreate.js`.
  const repoPkgScript = async function(pkg, ...args) {
    console.log('Running a pkg script script', pkg)
    await repoPkgScriptRunner(pkg, ...args)
  }

  // Run an npm run command.
  const npmRun = async function(...args) {
    console.log('Running npm run')
  }

  const ctx = {
    run,
    node,
    nodeApp,
    repoPkgBin,
    repoPkgScript,
    npmRun,
    // So we can do `app: {dev: help(() => {}, 'description')}
    help,
    repoRoot,
    projectRoot,
    cwd,
  }
  return ctx
}

// Runs a shell command.
function makeRun({repoRoot, projectRoot, cwd, config}) {
  return async function(cmd, opts = {}) {
    if (_.isUndefined(opts.envPrependProcessEnv)) opts.envPrependProcessEnv = true
    await runShell(cmd, opts, {repoRoot, projectRoot, cwd, config})
  }
}
