module.exports = (overrides) => (w) => {
  return {
    autoDetect: true,
    testFramework: {
      configFile: './jest.config.js',
      //configFile: './jest.config.wallaby.js',
    },
  }
}
