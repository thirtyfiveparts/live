import {spawn, exec} from 'promisify-child-process'
import path, {join} from 'path'
import _ from 'lodash'
import {filterGraph, findWorkspacePackages} from 'pnpm-filter-workspace-packages'
import createPkgGraph, { PackageNode } from 'pkgs-graph'

////////////////////////////////////////////////////////////////////////////////

let pkgGraph = null

// TODO(vjpr): Do we need to cache this? It is slow.
export async function getPkgGraph(workspacePrefix) {
  if (pkgGraph) return pkgGraph
  if (!workspacePrefix) throw new Error('You must provide init with workspace prefix.')
  const allWorkspacePkgs = await findWorkspacePackages(workspacePrefix)
  const pkgGraphResult = createPkgGraph(allWorkspacePkgs)
  pkgGraph = pkgGraphResult.graph
  return pkgGraphResult.graph
}

export async function getPkgNameRoot(pkgName) {
  const res = await runCmd(
    `pnpm m ls --porcelain --depth=-1 --filter=${pkgName}`,
  )
  return res[0]
}

export async function getPkgJsonFromPkgName(pkgName, pkgGraph) {
  const pkgSelectors = [{matcher: pkgName, scope: 'exact', selectBy: 'name'}]
  const res = filterGraph(pkgGraph, pkgSelectors)
  const firstResult = Object.entries(res)[0]
  const [path, result] = firstResult
  return result.manifest
}

// pnpm m ls --filter=./packages/config
// NOTE: Does not return dependencies of these deps!
//   See https://github.com/pnpm/pnpm/issues/1637#issuecomment-460946814
export async function getAllDepsByPathFromCli(dir) {
  return await runCmd(`pnpm m ls --porcelain --depth=-1 --filter=${dir}`)
}

export async function getAllDepsByPath(dirs, pkgGraph) {
  dirs = _.castArray(dirs)
  const pkgSelectors = dirs.map(dir => ({
    matcher: dir,
    scope: 'dependencies',
    selectBy: 'location',
  }))
  const res = filterGraph(pkgGraph, pkgSelectors)
  return Object.keys(res)
}

export async function getAllDeps(pkgNames, pkgGraph) {
  pkgNames = _.castArray(pkgNames)
  const pkgSelectors = pkgNames.map(pkgName => ({
    matcher: pkgName,
    scope: 'dependencies',
    selectBy: 'name',
  }))
  const res = filterGraph(pkgGraph, pkgSelectors)
  return Object.keys(res)
}

export async function getAllDepsFromCli(pkgNames) {
  pkgNames = _.castArray(pkgNames)
  const filters = pkgNames.map(pkgName => `--filter=${pkgName}...`).join(' ')
  const cmd = `pnpm m ls --porcelain --depth=-1 ${filters}`
  console.log({cmd})
  return await runCmd(cmd)
}

////////////////////////////////////////////////////////////////////////////////

export async function runCmd(cmd) {
  const {stdout, stderr, code} = await spawn(cmd, {
    encoding: 'utf8',
    shell: true,
  })
  // Workaround: https://github.com/pnpm/pnpm/issues/1650
  if (stdout.match(/No packages matched the filters/)) {
    return []
  }
  if (code) {
    throw new Error(stderr)
  }
  return stdout.split('\n').filter(p => p !== '')
}

export function getDestForPkgName(repoRoot, pkgName) {
  const destDir = '.docker-trees'
  const serPkgName = serializePkgName(pkgName)
  const dest = join(repoRoot, destDir, serPkgName)
  return dest
}

export function serializePkgName(pkgName) {
  return pkgName.replace('/', '--')
}

//import {Docker, Options} from 'docker-cli-js'
//async function dockerVersion() {
//  const docker = new Docker()
//  const res = await docker.command('version')
//  console.log(res)
//  console.log('hi')
//}
