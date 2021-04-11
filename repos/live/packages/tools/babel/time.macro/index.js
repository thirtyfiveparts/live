// Use BABEL_DISABLE_CACHE=1 when debugging.

const {createMacro, MacroError} = require('babel-plugin-macros')
const generate = require('@babel/generator').default

function inspect({references, state, babel}) {
  const t = babel.types

  const consoleLogAST = t.memberExpression(
    t.identifier('console'),
    t.identifier('log'),
  )

  const buildLog = babel.template(`
    console.time(DESC)
    const res = EXPRESSION
    console.timeEnd(DESC) 
  `)

  function replaceWithLog(path) {

    const functionName = path.node.arguments[0].callee.name

    const finalArgs = []
    path.node.arguments.forEach(arg => {
      const log = buildLog({
        EXPRESSION: arg,
        DESC: functionName,
      })
      finalArgs.push(t.stringLiteral(`${generate(arg).code} →`), log.expression)
    })
    path.node.arguments = finalArgs

    // Replaces macro function with console.log.
    path.node.callee = consoleLogAST
    //path.node.callee = null
  }

  references.default.forEach(path => {
    if (path.parentPath.type === 'CallExpression') {
      replaceWithLog(path.parentPath)
    } else {
      console.log('path.type is not a CallExpression', path.parentPath.type)
      throw new MacroError('inspect is intended to be called like a function')
    }
  })
}

module.exports = createMacro(inspect)
