// @flow weak
const refactor = require('./index')
const c = require('chalk')
const debug = require('debug')('replant')
const fs = require('fs')
const yaml = require('js-yaml')
const {unflatten, flatten} = require('flat')
const _ = require('lodash')
const glob = require('globby')
const hash = require('object-hash')
const _cwd = require('cwd')
const getCwd = require('cwd')
const {relative} = require('path')
const yargs = require('yargs')
const diff = require('jsondiffpatch')
const pp = require('prettyjson')
import path, {join} from 'path'

// Make path absolute.
function tidyModuleName(name, ctx) {
  const cwdRealPath = fs.realpathSync(ctx)
  return path.isAbsolute(name) ? name : path.join(cwdRealPath, name)
  //return name
}

export async function updateDependencies({cwd, fs, deltaItem, delta, roots, dependencies, dependencyOrDependent, dryRun}) {

  let [from, to] = deltaItem

  from = tidyModuleName(from, cwd)
  to = tidyModuleName(to, cwd)

  //if (!startsWithRoot(from, roots)) from = './' + from

  // TODO(vjpr): This is hacky. We should always use absolute paths.
  //   There is probably an absolute path in the webpack::Reason...
  dependencies = _.mapKeys(dependencies, (v, k) => tidyModuleName(k, cwd))
  //console.log('from', from)
  //console.log(dependencies)

  let deps = dependencies[from]

  if (!deps) {
    console.log(`Dependencies: none`)
    return
  }

  console.log(`Dependencies:`)

  // Skip duplicate userRequests in the same file because
  //   `modifyImports` can't tell the difference.
  deps = _(deps).uniqBy(dep => {
    return dep.reason.userRequest + '|' + dep.mod.name
  }).value()

  // TODO(vjpr): The names are all messed up here (dependent vs. dependency).
  for (const dep of deps) {
    const dependentPathOriginal = dep.mod.name
    const {userRequest} = dep.reason
    const dependentPath = getDependentPath(delta, dependentPathOriginal)
    let newImportPath = getNewPathWithoutIndex(to, dependentPath, roots)
    const dependentHasMoved = dependentPath !== dependentPathOriginal
    let formerly = dependentHasMoved ? ` (formerly ${c.magenta(dependentPathOriginal)})` : ''
    const str = `The module you are moving depends on ${c.magenta(dependentPath)} using the request path ${c.magenta(userRequest)}`
    console.log(str)
    await refactor.modifyImport({fs, dependentPath: to, dependentPathOriginal: from, userRequest, newImportPath})
  }

}

export async function modifyDependents({cwd, fs, deltaItem, delta, roots, dependents, dependencyOrDependent, dryRun}) {

  let [from, to] = deltaItem

  from = tidyModuleName(from, cwd)
  to = tidyModuleName(to, cwd)

  //if (!startsWithRoot(from, roots)) from = './' + from

  // TODO(vjpr): This is hacky. We should always use absolute paths.
  dependents = _.mapKeys(dependents, (v, k) => tidyModuleName(k, cwd))
  //console.log('from', from)
  //console.log(dependents)

  let deps = dependents[from]

  if (!deps) {
    console.log('No dependents found.')
    return
  }

  console.log(`Dependents:`)

  // Skip duplicate userRequests in the same file because
  //   `modifyImports` can't tell the difference.
  deps = _(deps).uniqBy(dep => {
    return dep.userRequest + '|' + dep.module
  }).value()

  for (const dep of deps) {
    const dependentPathOriginal = dep.module
    const {userRequest} = dep
    const dependentPath = getDependentPath(delta, dependentPathOriginal)
    let newImportPath = getNewPathWithoutIndex(dependentPath, to, roots)
    const dependentHasMoved = dependentPath !== dependentPathOriginal
    let formerly = dependentHasMoved ? ` (formerly ${c.magenta(dependentPathOriginal)})` : ''
    const str = `In ${c.magenta(dependentPath)}${formerly}, there is a ${c.magenta(dep.type)} statement using the path ${c.magenta(dep.userRequest)} which references the ${c.green('module you are moving')}.`
    console.log(str)
    await refactor.modifyImport({fs, dependentPath, dependentPathOriginal, userRequest, newImportPath, dryRun})
  }

}

////////////////////////////////////////////////////////////////////////////////

// Check if the dependent module has been moved.
// Returns new path, or false.
function getDependentPath(delta, name) {
  let newPath = name
  const isMovedOrRenamed = d => d.length === 2
  _(delta).forEach((d) => {
    if (isMovedOrRenamed(d) && d[0] === name) newPath = d[1]
  })
  return newPath
}

function getNewPathWithoutIndex(dependent, to, roots) {
  let p = getNewPath(dependent, to, roots)
  // TODO(vjpr): This might break when its a root item. Edge case.
  if (p.endsWith('/index.js') && !p.endsWith('./index.js') && p !== 'index.js') return p.replace(/\/index.js$/, '')
  return p
}

function getNewPath(dependent, to, roots) {

  // TODO(vjpr): Don't include `/index` on the end of paths.

  // If we are both inside the same root, and first dir down, use a relative path.
  // NOTE: This is a special case for Live support.
  //   Because folders in `modules` should not depend on each other with relative paths.
  function sameFolderOfSameRoot() {
    const toSegs = to.split('/')
    const modSegs = dependent.split('/')
    //console.log({toSegs, modSegs})
    const sameFirstSegment = toSegs[0] === modSegs[0]
    const sameSecondSegment = toSegs[1] === modSegs[1]
    const firstSegmentIsRoot = isRoot(toSegs[0], roots)
    return sameFirstSegment && sameSecondSegment && firstSegmentIsRoot
  }

  function getRelativePath() {
    let newImportPath = path.relative(path.dirname(dependent), to)
    // TODO(vjpr): If it doesn't start with a dot slash. Add it.
    if (!newImportPath.startsWith('.')) newImportPath = './' + newImportPath
    return newImportPath
  }

  if (sameFolderOfSameRoot()) {
    return getRelativePath()
  }

  console.log('a', to, roots)
  let _root
  if (_root = startsWithRoot(to, roots)) {
    // If its in a root like `modules/foo` use the root-relative path.
    return trimPathSegment(to, _root)
  } else {
    return getRelativePath()
  }

}

function isRoot(item, roots) {
  return _(roots).find(r => r === item)
}

// Find root that starts it.
function startsWithRoot(to, roots) {
  // TODO(vjpr): Brittle!
  //return _(roots).find(r => to.split('/')[0] === r)
  // We can do this with absolute paths.
  return _(roots).find(r => to.startsWith(r))
}

function trimPathSegment(p, root) {
  return p.replace(root + '/', '')
}
