//const fs = require('fs')
import * as util from 'util'
import pify from 'pify'
const debug = require('debug')('make-dependents-map')
const _ = require('lodash')
const path = require('path')
const c = require('chalk')
const j = require('jscodeshift')
import {getWebpackConfig} from './get-webpack-config'
const webpack = require('webpack')
import to from 'await-to'

export async function makeDependentsMap({cwd, root}) {
  const config = await getWebpackConfig({cwd, root})

  const compiler = webpack(config)

  const runAsync = pify(compiler.run.bind(compiler))

  const [err, stats] = await to(runAsync())

  if (err) {
    throw err
  }

  //if (e) throw e
  if (stats.hasErrors()) {
    stats.toJson().errors.map(e => {
      console.log(e)
      console.log(
        '------------------------------------------------------------------------------',
      )
    })
    //return
    throw 'Webpack failed.'
  }

  const json = stats.toJson({modules: true})

  const dependents = {}
  const dependencies = {}

  json.modules.map(mod => {
    //console.log(mod)
    dependents[mod.name] = dependents[mod.name] || []
    //const deps = mod.reasons.map(r => r.module)
    const deps = mod.reasons
    dependents[mod.name].push(...deps)

    mod.reasons.map(reason => {
      dependencies[reason.module] = dependencies[reason.module] || []
      dependencies[reason.module].push({mod, reason})
    })
  })

  return {dependents, dependencies}
}

function findAndModifyRequires(code, userRequest, newImportPath) {
  return j(code)
    .find(j.CallExpression, {callee: {name: 'require'}})
    .forEach(path => {
      const name = path.value.arguments[0].value
      if (name === userRequest) {
        path.value.arguments[0].value = removeFileExt(newImportPath)
      }
    })
    .toSource({quote: 'single'})
}

function findAndModifyImports(code, userRequest, newImportPath) {
  return j(code)
    .find(j.ImportDeclaration)
    .forEach(path => {
      const name = path.value.source.value
      if (name === userRequest) {
        path.value.source.value = removeFileExt(newImportPath)
      }
    })
    .toSource({quote: 'single'})
}

export async function modifyImport({
  fs,
  dependentPath,
  dependentPathOriginal,
  userRequest,
  newImportPath,
  dryRun,
}) {
  const originalCode = fs.read(dependentPathOriginal) // Returns utf8

  let newCode = originalCode
  newCode = findAndModifyRequires(newCode, userRequest, newImportPath)
  newCode = findAndModifyImports(newCode, userRequest, newImportPath)

  // Diff

  const diff = require('diff')
  const delta = diff.diffLines(originalCode, newCode)
  console.log('Changes to ' + c.magenta(dependentPath))
  console.log(
    '------------------------------------------------------------------------------',
  )
  printDiff(delta)
  console.log(
    '------------------------------------------------------------------------------',
  )

  // TODO(vjpr): Implement modifications.

  debug('Writing new code to:' + dependentPathOriginal)
  if (!dryRun) fs.write(dependentPathOriginal, newCode)
}

// TODO(vjpr): We should only do this if there is not another
//   module in the same dir with the same extension.
// For now we only remove extension for js files.
function removeFileExt(x) {
  return x.replace(/\.[^/.]+$/, a => {
    return a === '.js' ? '' : a
  })
}

function printDiff(diff) {
  diff.forEach(function (part) {
    // green for additions, red for deletions
    // grey for common parts
    var color = part.added ? 'green' : part.removed ? 'red' : 'grey'
    const sym = part.added ? '+ ' : part.removed ? '- ' : '  '
    // TODO: Indent all lines.
    process.stdout.write(c[color](part.value))
    //process.stdout.write(c[color](sym + part.value));
  })
}
