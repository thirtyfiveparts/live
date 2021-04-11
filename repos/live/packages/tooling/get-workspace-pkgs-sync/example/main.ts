// TEST: Run this file.

import {getTransitiveDependencies} from '@live/get-workspace-pkgs'

export default async function main() {
  a()
  //b()
  //c().then()

  const cwd = process.cwd()

  function a() {
    const {getTransitiveDependenciesSync} = require('../index')
    //const pkgName = 'gitsplit'
    const pkgName = undefined
    const parentDir = '/Users/Vaughan/dev-mono/thirtyfive/repos/sync'
    const filter = ['{repos/sync}...']
    const out = getTransitiveDependenciesSync(cwd, filter, pkgName, parentDir)
    console.log(Object.entries(out).map(([dir, pkg]) => dir))
    //console.log(JSON.stringify(out, null, 2))
  }

  console.log(
    '-----------------------------------------------------------------------------',
  )

  function b() {
    // Get all.
    const {getWorkspacePackagesSync} = require('../index')
    const workspacePkgs = getWorkspacePackagesSync(cwd)
    console.log(JSON.stringify(workspacePkgs, null, 2))
  }

  async function c() {
    const pkgName = undefined
    //const parentDir = '/Users/Vaughan/dev-mono/thirtyfive/repos/live'
    const parentDir = undefined
    const filter = ['{repos/sync}...']
    const graph = await getTransitiveDependencies(cwd, filter, pkgName, parentDir)
    console.log(Object.entries(graph).map(([dir, pkg]) => dir))
  }


}
