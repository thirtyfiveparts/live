// We disable `console.log` because we sometimes run this as child_process and all stdout is captured as output.
/* eslint no-console: "error" */

import findWorkspacePackages from '@pnpm/find-workspace-packages'
import _ from 'lodash'
import findUp from 'find-up'
import path, {join} from 'path'
import {
  readProjects,
  parsePackageSelector,
  filterPackages,
} from '@pnpm/filter-workspace-packages'
//const {PackageNode} = require('pkgs-graph')
//const createPkgGraph = require('pkgs-graph')
const findWorkspaceDir = require('@pnpm/find-workspace-dir').default

export async function getPackageDirFromName(pkgName) {
  const workspaceRoot = getRepoRoot()
  const pkgs = await getWorkspacePackages({workspaceRoot})
  const pkg = _.find(pkgs, p => p.manifest.name === pkgName)
  return pkg?.dir
}

// TODO(vjpr): For transitive see: https://github.com/pnpm/pnpm/tree/master/packages/pkgs-graph.
export async function findDependents(pkgName) {
  const workspaceRoot = getRepoRoot()
  const pkgs = await getWorkspacePackages({workspaceRoot})
  const dependents = _.filter(pkgs, p =>
    Object.keys(p.manifest.dependencies ?? {}).includes(pkgName),
  )
  return dependents
}

let pkgs
// reload - reload from disk
export async function getWorkspacePackages({workspaceRoot, reload} = {}) {
  workspaceRoot = workspaceRoot ?? getRepoRoot()
  if (pkgs && !reload) return pkgs
  pkgs = await findWorkspacePackages(workspaceRoot, {
    engineStrict: false,
    patterns: undefined,
  })
  return pkgs
}

export function getRepoRoot() {
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  const repoRoot = path.dirname(rootPath)
  return repoRoot
}

let repoRootCached
export function getRepoRootCached() {
  if (repoRootCached) return repoRootCached
  repoRootCached = getRepoRoot()
  return repoRootCached
}

////////////////////////////////////////////////////////////////////////////////

async function doFilterPackages(cwd, filter) {
  const workspaceDir = await findWorkspaceDir(cwd)
  const pkgs = await getWorkspacePackages({workspaceRoot: workspaceDir})
  const opts = {
    linkWorkspacePackages: false,
    workspaceDir,
    prefix: workspaceDir,
  }
  const {unmatchedFilters, selectedProjectsGraph} = await filterPackages(
    pkgs,
    filter,
    opts,
  )
  return selectedProjectsGraph
}

export async function getTransitiveDependencies(
  cwd,
  filter,
  pkgName,
  parentDir,
) {
  if (filter) {
    return doFilterPackages(cwd, filter)
  }

  const workspaceDir = await findWorkspaceDir(cwd)
  const opts = {
    linkWorkspacePackages: false,
  }

  const pkgSelectors = []
  // We can select by parent directory or pkg name.
  const selector = {
    namePattern: pkgName, // E.g. `@org/app`
    parentDir, // E.g. repos/live
  }
  pkgSelectors.push({
    ...selector,
    includeDependencies: true,
    excludeSelf: false,
  })
  const {allProjects, selectedProjectsGraph} = await readProjects(
    workspaceDir,
    pkgSelectors,
    opts,
  )
  return selectedProjectsGraph
}

//async function getTransitiveDependencies(cwd, pkgName) {
//  const workspaceRoot = await findWorkspaceDir(cwd)
//  let allWorkspacePkgs = await findWorkspacePackages(workspaceRoot, {
//    engineStrict: false,
//    patterns: undefined,
//  })
//  const pkgGraphResult = createPkgGraph(allWorkspacePkgs)
//  const packageSelectors = []
//  packageSelectors.push({
//    matcher: pkgName, // E.g. `@org/app`
//    scope: 'dependencies',
//    selectBy: 'name',
//  })
//  const res = filterGraph(pkgGraphResult.graph, packageSelectors)
//  return res
//}
