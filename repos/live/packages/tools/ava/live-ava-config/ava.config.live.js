const fs = require('fs')
const {join} = require('path')

module.exports = (overrides = {}) => ({projectDir}) => {
  console.log({projectDir})

  // We only use the local `register.js` if there is not one in the monorepo.
  // This config can also be used by individual packages.
  let require
  const monorepoAvaRegister = join(projectDir, './tools/ava/register.js')
  const libraryAvaRegister = join(__dirname, 'register.js')
  if (!fs.existsSync(monorepoAvaRegister)) {
    require = [libraryAvaRegister]
  } else {
    require = [monorepoAvaRegister]
  }

  return {
    require,
    babel: {
      extensions: ['ts', 'tsx', 'js', 'jsx'],
      testOptions: {
        babelrc: true,
        configFile: true,
        presets: [['module:@ava/babel/stage-4', false]],
      },
    },
    files: ['**/*.test.ava.ts'],
    ...overrides,
  }
}
