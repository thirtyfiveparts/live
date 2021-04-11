// We disable `console.log` because we are running as child_process and all stdout is captured as output.
/* eslint no-console: "error" */

////////////////////////////////////////////////////////////////////////////////
// NOTE: This is run via `child_process#spawn` from `entry.js`.
////////////////////////////////////////////////////////////////////////////////

import findWorkspaceDir from '@pnpm/find-workspace-dir'
import {getTransitiveDependencies} from '@live/get-workspace-pkgs'
import findWorkspacePackages from '@pnpm/find-workspace-packages'

export default async function main() {
  // E.g. node foo.js {fn: cwd, args: [getWorkspacePackages, foo]}

  const pargs = process.argv.slice(2)

  // Deserialize args from json.
  const argsAsJsonStr = pargs[0]
  const argJsonStr = Buffer.from(argsAsJsonStr, 'base64').toString('ascii')

  const {fn, args} = JSON.parse(argJsonStr)

  // This is run in a separate process so we print to output.
  const res = await api[fn](...args)

  // This is the output sent to stdout. Must be JSON parseable.
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(res, null, 0))
}

////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Move this into `get-workspace-pkgs`.
async function getWorkspacePackages(cwd) {
  const workspaceRoot = await findWorkspaceDir(cwd)
  let pkgs = await findWorkspacePackages(workspaceRoot, {
    engineStrict: false,
    patterns: undefined,
  })
  // We need to remove function `writeManifestFile`.
  pkgs = pkgs.map(pkg => ({manifest: pkg.manifest, dir: pkg.dir}))
  return pkgs
}

////////////////////////////////////////////////////////////////////////////////

const api = {
  getWorkspacePackages,
  getTransitiveDependencies,
}

////////////////////////////////////////////////////////////////////////////////
