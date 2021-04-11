require = require('esm')(module /*, options*/)

const Module = require('module')

const oldResolveFilename = Module._resolveFilename
Module._resolveFilename = function(request, parent, isMain) {
  console.log({request, parent})
  try {
    let filename = oldResolveFilename.call(this, request, parent, isMain)
    return filename
  } catch (e) {
    throw e
  }
}

const operationJson = require('./resp')
const out = require('../index').default(operationJson)
console.log(out)
