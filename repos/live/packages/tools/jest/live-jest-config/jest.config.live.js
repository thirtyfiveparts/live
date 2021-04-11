const {join} = require('path')
const {defaults} = require('jest-config')
module.exports = (overrides) => ({
  // TODO(vjpr): Do we need this?
  testMatch: ['**/+(*.)+(spec|test).+(ts|js)?(x)'],
  // --
  // TODO(vjpr): Maybe this can help with symlink issues.
  //resolver:
  // --
  verbose: true,
  // Otherwise we get:
  //   `2020-06-08T14:03:13.489Z processor WARNING: could not find and load babel-preset-jest preset, it is required for correct jest.mock(...) calls hoisting`
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',
  },
  modulePathIgnorePatterns: [
    // Ignore new monorepo template files.
    'repos/live/packages/live-cli/live-monorepo-cli/templates/template-monorepo-files',
  ],
  moduleFileExtensions: [...defaults.moduleFileExtensions, 'ts', 'tsx'],
  setupFilesAfterEnv: [join(__dirname, './jest.setup.js')],
  ...overrides,
})
