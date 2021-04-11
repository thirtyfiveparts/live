# @live/babel-preset-live-node-simple

> A simple preset with some new syntax features. For use with cli tools that need to be transpiled on the fly.

- `import foo from '@src/modules/foo'` -> `src/modules/foo`.
- `await import('foo')`
- `??`
- `foo?.bar`

---

The alternative to relying on this is to add `.babelrc.js` file to your package with same same config. This also works.

---

NOTE: We include `scripts.build` so that when we build @live/cli dependencies this does not error.

