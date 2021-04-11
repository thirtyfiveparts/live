import {
  listProjects,
  printBins,
  sectionHeaderRepoBinsFromRepoRoot,
} from '@live/cli-core/src/printers'

import {existsSync} from 'fs'

import _ from 'lodash'
import path, {join} from 'path'

import findProjects from '@live/find-projects'
import run from '../runners/project-shell-cmd'

import makeNode from '../runners/node'

import {findBin} from '@live/find-projects'
import exit from '@src/modules/exit'

// NOTE: Will not append .js to the request.
// pkgRequest = a package and the path to the module. Same that you could pass into require.
export default function({repoRoot, projectRoot, config, cwd}) {

  const node = makeNode({run, repoRoot, projectRoot})

  return async function(pkgRequest, ...args) {

    const projects = await findProjects({config, cwd})

    const {packageName, packagePathSelector} = parsePackageRequestString(
      pkgRequest,
    )

    const pkg = findPkgScript(projects, packageName)

    const scriptPath = join(pkg.root, packagePathSelector)
    const absScriptPath = join(pkg.absRoot, packagePathSelector)
    const resolvedAbsScriptPath = require.resolve(absScriptPath)

    if (!existsSync(resolvedAbsScriptPath)) {
      console.error('Could not find script:', resolvedAbsScriptPath)
      return exit(1)
    }

    node(resolvedAbsScriptPath, ...args)

  }
}

////////////////////////////////////////////////////////////////////////////////

export function findPkgScript(projects, pkg) {
  return _(projects).find(p => p.name === pkg)
}

////////////////////////////////////////////////////////////////////////////////

function parsePackageRequestString(request) {
  const isScoped = request.charAt(0) === '@'
  const parts = request.split('/')
  const packageName = isScoped ? parts.slice(0, 2).join('/') : parts[0]
  const packagePathSelector = isScoped
    ? parts.slice(2).join('/')
    : parts.slice(1).join('/')
  return {packageName, packagePathSelector}
}
