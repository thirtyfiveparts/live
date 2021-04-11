// Disabled flow
import Debug from 'debug'
const debug = Debug('babel-plugin-react-element-info')

export default function({types: t}) {
  const defaultPrefix = 'data-qa'
  let prefix
  let filenameAttr
  let nodeNameAttr

  const visitor = {
    Program(path, state) {

      if (state.opts.prefix) {
        prefix = `data-${state.opts.prefix}`
      } else {
        prefix = defaultPrefix
      }

      const isProd = process.env.NODE_ENV === 'production'
      state.opts.showFile = state.opts.showFile || !isProd

      state.opts.ignore = state.opts.ignore || []
      state.opts.getFile = state.opts.getFile || ((f, l, c) => f + `:${l}:${c}`)

      filenameAttr = `${prefix}-file`
      nodeNameAttr = `${prefix}-node`
    },
    JSXOpeningElement(path, state) {
      const attributes = path.container.openingElement.attributes

      const name = path.container.openingElement.name.name
      let shouldIgnore = state.opts.ignore.some(i => i === name)

      debug({name, shouldIgnore})

      /*
      console.log(path.container.openingElement.name)

      Node {
        type: 'JSXIdentifier',
        start: 1251,
        end: 1261,
        loc:
         SourceLocation {
           start: Position { line: 38, column: 13 },
           end: Position { line: 38, column: 23 } },
        name: 'ContentRow' }

      */

      // TODO(vjpr): Should we still put the file location of `div`s?
      //   At least it should be separately configurable.
      //shouldIgnore = shouldIgnore || (name === 'div')

      if (shouldIgnore) return

      const newAttributes = []

      if (
        path.container &&
        path.container.openingElement &&
        path.container.openingElement.name &&
        path.container.openingElement.name.name
      ) {

        if (!shouldIgnore) {
          newAttributes.push(
            t.jSXAttribute(
              t.jSXIdentifier(nodeNameAttr),
              // TODO(vjpr): Change to just `name`.
              t.stringLiteral(path.container.openingElement.name.name),
            ),
          )
        }
      }

      // TODO(vjpr): Get the `import` request path associated with a React component.
      //   So we can filter specific components.
      //   We would also have to resolve the component - but this might be too hard.

      if (state.opts.showFile) {
        // TODO(vjpr): Use `?.` syntax.
        if (state.file && state.file.opts && state.file.opts.filename) {
          const filename = state.file.opts.filename
          const {line, column} = path.container.openingElement.loc.start
          const file = state.opts.getFile(filename, line, column)
          newAttributes.push(
            t.jSXAttribute(
              t.jSXIdentifier(filenameAttr),
              t.stringLiteral(file),
            ),
          )
        }
      }

      attributes.push(...newAttributes)
    },
  }

  return {
    visitor,
  }
}
