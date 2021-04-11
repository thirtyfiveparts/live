module.exports = (overrides) => (w) => {
  return {
    files: ['jest.config.js', '**/src/**/*.ts', '!**/src/**/*.test.ts'],

    tests: [
      '**/src/*.test.ts',
      '**/src/**/*.test.ts',
      // Skip e2e tests because they encounter rate-limiting.
      //'!**/src/**/*.e2e.test.ts',
    ],

    env: {
      type: 'node',
    },

    compilers: {
      '**/*.ts?(x)': w.compilers.typeScript({
        module: 'commonjs',
      }),
    },

    testFramework: 'jest',

    debug: true,

    runMode: 'onsave',

    setup: (w) => {
      global.wallabySessionId = w.sessionId
      global.wallabyWorkerId = w.workerId

      const {join} = require('path')
      //w._testFrameworkPath
      const jestConfigPath = join(w.localProjectDir, './jest.config.js')
      console.log({jestConfigPath})
      const jestConfig = require(jestConfigPath)
      w.testFramework.configure(jestConfig)
    },

    ...overrides,

  }
}
