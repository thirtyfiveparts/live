const load = require('@commitlint/load')
//const read = require('@commitlint/read')
const lint = require('@commitlint/lint')

test.only('foo', async () => {
  console.log('hi')

  const input = 'foo1: bar'
  const rules = {'type-enum': [1, 'always', ['bar']]}
  let customOpts = {
    parserOpts: {
      headerPattern: /^(\w*)-(\w*)/,
      headerCorrespondence: ['type', 'scope'],
    },
  }

  const opts = await load({}, {file: './node_modules/@commitlint/config-conventional/index.js', cwd: __dirname})
  const report = await lint(input, rules, {...opts, ...customOpts}) //?

  expect(report.valid).toBe(true)
  expect(report.warnings.length).toBe(0)
})
