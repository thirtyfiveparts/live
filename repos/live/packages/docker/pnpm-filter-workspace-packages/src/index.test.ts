import test from 'ava'
import {filterGraph} from './filter'
import createPkgGraph, { PackageNode } from 'pkgs-graph'
import packageSelector from './parse-package-selectors'
import findWorkspacePackages from './find-workspace-packages'
//import {WORKSPACE_MANIFEST_FILENAME} from './constants'
//import findUp from 'find-up'
//import path, {join} from 'path'

test.skip('test', async t => {

  const packageSelectors = []
  packageSelectors.push({
    matcher: '@org/app',
    scope: 'dependencies',
    selectBy: 'name',
  })

  //const workspaceManifestLocation = findUp.sync(WORKSPACE_MANIFEST_FILENAME)
  //const workspacePrefix = path.dirname(workspaceManifestLocation)
  const workspacePrefix = '' // DEBUG
  const allWorkspacePkgs = await findWorkspacePackages(workspacePrefix)
  const pkgGraphResult = createPkgGraph(allWorkspacePkgs)

  const res = filterGraph(pkgGraphResult.graph, packageSelectors)
  console.log({res})

})
