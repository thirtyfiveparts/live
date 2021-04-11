import Debug from 'debug'
const debug = Debug('babel-plugin-example')

export default function({types: t}) {
  const visitor = {
    Program(path, state) {
      const isProd = process.env.NODE_ENV === 'production'
      state.opts.foo = state.opts.foo || !isProd
    },
  }

  return {
    visitor,
  }
}
