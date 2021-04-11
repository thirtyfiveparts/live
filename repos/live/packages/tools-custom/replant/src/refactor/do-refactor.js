// @flow weak
import path, {join} from 'path'
const refactor = require('./index')
const {modifyDependents, updateDependencies} = require('./modify-dependents')
import c from 'chalk'
import _ from 'lodash'
import fse from 'fs-extra'

// TODO(vjpr): Rename to refactorManager.
export default async function({fs, cwd, delta, dryRun}) {

  let roots = [
    'modules',
    'node_modules',
    // For falling back to replant module.
    path.join(__dirname, 'node_modules'),
  ]

  roots = roots.map(r => path.isAbsolute(r) ? r : path.resolve(fse.realpathSync(cwd), r))

  const {dependents, dependencies} = await refactor.makeDependentsMap({cwd, root: roots})
  if (!dependents) {
    // TODO(vjpr): Parse error messages and provide some assistance.
    console.error(c.red('Failed to build dependency graph. Please fix webpack errors.'))
    throw new Error('Failed to build dependency graph. Please fix webpack errors.')
  }



  // DEBUG
  printDeps(dependents)
  // DEBUG

  for (const k in delta) {

    const deltaItem = delta[k]

    //console.log(d)

    if (deltaItem.length === 2) {

      ////////////////////
      // Modify
      ////////////////////

      let [from, to] = deltaItem
      console.log(`Moving ${c.red(from)} to ${c.green(to)}`)

      await modifyDependents({cwd, fs, deltaItem, delta, roots, dependents, dryRun})
      // TODO(vjpr): Update require/import statements in module.
      await updateDependencies({cwd, fs, deltaItem, delta, roots, dependencies, dryRun})

    } else if (deltaItem.length === 3) {

      ////////////////////
      // Delete
      ////////////////////

      // TODO(vjpr): Check dependents. User will need to confirm these issues.

    }

  }

}

function printDeps(dependencyMap) {
  const prettyMap = _(dependencyMap)
    .mapValues(reasons =>
      reasons.map(r => _.omit(r, ['moduleIdentifier']))
    )
    .value()
  if (prettyMap) {
    console.log('Dependency map', require('prettyjson').render(prettyMap))
  } else {
    console.log('Dependency map is empty')
  }
}
