/*eslint no-undef: "error"*/
/*eslint-env node*/

/*

TODO

Some plugin seems to be running before us and messing up the comments.

Some plugin is attaching a visitor to Program or something higher up than ouor ExpressionStatement visitor.

Maybe it is this:

See `babel-plugin-transform-async-to-generator`
https://github.com/babel/babel/blob/master/packages/babel-plugin-transform-async-to-generator/src/index.js.

Idea:

We could attach to Program and pass the file ourselves line-by-line and attach the comments to the correct nodes in the AST.

*/

const generate = require('@babel/generator').default
const template = require('@babel/template').default
const get = require('lodash.get')

const alreadyProcessed = {}
const alreadyProcessedComments = {}

module.exports = function jsperf(opts) {
  const {types: t} = opts
  const PLUGIN_LABEL = 'jsperf'

  function createTimerStatement(callee, name, opts = {}) {
    const optsAST = t.objectExpression(
      Object.entries(opts).map(([k, v]) =>
        t.objectProperty(t.identifier(k), t.stringLiteral(String(v))),
      ),
    )

    return t.expressionStatement(
      t.callExpression(callee, [t.stringLiteral(name), optsAST]),
    )
  }

  function getName(path) {
    if (path.node.id && path.node.id.name) {
      return path.node.id.name
    }

    const variableParent = path.findParent(p => p.isVariableDeclarator())
    if (variableParent && t.isIdentifier(variableParent.node.id)) {
      return variableParent.node.id.name
    }

    return 'function'
  }

  // TODO: Need to check if this is the correct node type to catch every line.
  function ExpressionStatement(path, state) {
    if (!path.node) return

    let nodeStart = null

    if (path.node.loc) {
      nodeStart = path.node.loc.start
    } else {
      nodeStart = get(path, 'node.expression.left.loc.start', {})
    }

    const {leadingComments, trailingComments} = path.node

    function includesPluginLabel(c) {
      return c.value.includes(PLUGIN_LABEL)
    }

    function hasMagicComment() {
      // TODO(vjpr): LeadingComments don't show when traversing from Program.
      const condA =
        leadingComments &&
        leadingComments.some(c => {
          // TODO(vjpr): This is not a reliable check. After an async transform has happened it will be in very different place.
          //   Why can't we run before async transforms though!
          const onLineAboveNode = c.loc.start.line === nodeStart.line - 1
          //console.log(c.loc.start.line, nodeStart.line, c.value)
          //console.log(path.node, onLineAboveNode)
          if (includesPluginLabel(c)) {
            //console.log(path.node)
            //console.log(generate(path.node).code, alreadyProcessed[path.node])
            //console.log('---')
          }
          //return includesPluginLabel(c) && onLineAboveNode

          // TODO(vjpr):

          /*
          We need to work around this case. There also happens to be the reverse case too.

            Input:

              // jsperf
              const a = 1

              // jsperf
              const {default: main} = await import('./modules/index')

              // ---

              foo() // jsperf
              const a = 1

            Output:

              // jsperf
              a = 1; // jsperf

              // --

              foo()

              // jsperf
              const b = 1

           */

          if (!includesPluginLabel(c)) return false

          if (!c.processed) {
            c.processed = true
            return true
          }

          //return  !alreadyProcessed[path.node.start]
        })

      // Trailing comments are anything after this statement and before the next one.
      const condB =
        trailingComments &&
        trailingComments.some(c => {
          const onSameLineAsNode = c.loc.start.line === nodeStart.line

          if (!includesPluginLabel(c)) return false

          return true

          //if (!c.processed) {
          //  c.processed = true
          //  return true
          //}

          //return includesPluginLabel(c) && !alreadyProcessed[path.node.start]
          //return includesPluginLabel(c) && onSameLineAsNode
        })

      return condA || condB
    }

    if (!hasMagicComment()) return

    alreadyProcessed[path.node.start] = true

    const out = generate(path.node, {
      //retainFunctionParens: true,
      //retainLines: true, // This prints too many blank lines.
      //shouldPrintComment: false,
      comments: false, // We don't print comments.
      // Whitespace reduction options:
      //compact: true,
      concise: true,
      // --
      sourceMaps: false,
    })

    let name = out.code

    const {timerCallee, timerEndCallee} = getTimerCallees(t, path, state)

    // Remove comment so its not processed twice.
    // TODO(vjpr): Could instead just remove the PLUGIN_LABEL word instead of whole line.
    if (leadingComments) {
      path.node.leadingComments = leadingComments.filter(
        c => !c.value.includes(PLUGIN_LABEL),
      )
    }

    if (trailingComments) {
      path.node.trailingComments = trailingComments.filter(c => {
        const onSameLineAsNode = c.loc.start.line === nodeStart.line
        return !c.value.includes(PLUGIN_LABEL) && onSameLineAsNode
      })
    }

    // TODO(vjpr): Find out why path.node.loc sometimes doesn't exist.
    const {line, column} = nodeStart

    const {filename} = state
    const relPath = require('path').relative(state.cwd, state.filename)
    const prettyPath = `${relPath}:${line}:${column}`
    const timerOpts = {prettyPath, relPath, filename, line, column}

    path.insertBefore(createTimerStatement(timerCallee, name, timerOpts))
    path.insertAfter(createTimerStatement(timerEndCallee, name, timerOpts))
  }

  return {
    name: 'babel-plugin-jsperf',
    visitor: {
      // Why use Program?
      //   We use Program to make sure we run first. If we run after other babel plugins our comments may get moved around.
      //   See https://jamie.build/babel-plugin-ordering.html.
      // But, why we can't use Program?
      //   If we use program, Babel won't have added leading and trailing comments to nodes yet so we can't use it.
      //
      //Program(programPath, state) {
      //  programPath.traverse({
      //    ExpressionStatement: (path) => ExpressionStatement(path, state),
      //  })
      //},
      // ---

      'ExpressionStatement|VariableDeclaration': (path, state) =>
        ExpressionStatement(path, state),

      Function(path, state) {
        const {timerCallee, timerEndCallee} = getTimerCallees(t, path, state)

        const comments = (path.node && path.node.leadingComments) || []

        if (!comments.some(c => c.value.includes(PLUGIN_LABEL))) {
          return
        }
        if (path.isArrowFunctionExpression()) {
          path.arrowFunctionToShadowed()
        }
        const name = getName(path)

        path
          .get('body')
          .unshiftContainer('body', [createTimerStatement(timerCallee, name)])
        let returnStatement = false
        path.traverse({
          ReturnStatement(returnPath) {
            const id = returnPath.scope.generateUidIdentifier('returnValue')
            returnPath.insertBefore(
              t.variableDeclaration('var', [
                t.variableDeclarator(id, returnPath.node.argument),
              ]),
            )

            returnPath.insertBefore(createTimerStatement(timerEndCallee, name))
            returnStatement = true
            returnPath.node.argument = id
          },
        })

        if (!returnStatement) {
          path
            .get('body')
            .pushContainer('body', createTimerStatement(timerEndCallee, name))
        }
      },
    },
  }
}

function getTimerCallees(t, path, state = {}) {
  let {opts} = state
  opts = opts || {}
  const timerObject = opts.timerObject || 'console'
  const timerStart = opts.timerStart || 'time'
  const timerEnd = opts.timerEnd || 'timeEnd'

  let timerCallee = t.memberExpression(
    t.identifier(timerObject),
    t.identifier(timerStart),
    false,
  )

  let timerEndCallee = t.memberExpression(
    t.identifier(timerObject),
    t.identifier(timerEnd),
    false,
  )

  return {timerCallee, timerEndCallee}
}
