////////////////////

// NOTE: This is no longer necessary because with pnpm we use
//  `hoist-patterns-public` to ensure all eslint plugins are hoisted to the top-level.

// See https://github.com/eslint/eslint/issues/3458#issuecomment-637827875

// You must use `eslint --resolve-plugins-relative-to=<full-path-to-shareable-config>`
//   because plugins as dependencies are not supported for plugins.

// WebStorm currently needs to be patched for it to work.)

// See: https://youtrack.jetbrains.com/issue/WEB-43692#focus=streamItem-27-4170185.0-0

////////////////////

// Config is inspired by: https://github.com/typescript-eslint/typescript-eslint/issues/109#issuecomment-536160947

////////////////////

// TODO(vjpr): Maybe we make this config more aspect-oriented style.

// Dev Testing
////////////////////

// To test this config run `eslint` from the repo root and target a single file.

// Rules
////////////////////////////////////////////////////////////////////////////////

const graphqlRules = require('./graphql')

const commonRules = {
  // Prettier - match our custom prettier config from `package.json#prettier`.
  // TODO: I think prettier plugin might infer settings.
  ////////////////////

  // See `package.json#prettier`
  quotes: ['error', 'single'],
  semi: ['error', 'never'],
  'comma-dangle': ['error', 'always-multiline'],
  'linebreak-style': ['error', 'unix'],
  // See SwitchCase: https://eslint.org/docs/rules/indent#options
  indent: ['error', 2, {SwitchCase: 1}],

  // Node
  ////////////////////

  'node/no-unsupported-features/es-syntax': 'off',
  // We use `eslint-import-resolver-babel-module` for this.
  'node/no-missing-import': 'off',
  'node/no-missing-require': 'off',
  // In a monorepo we work with unpublished requires all the time.
  'node/no-unpublished-require': 'off',
  // --
  // NOTE: Do not disable this. It ensure that your file is in `package.json#bin` if it has a shebang.
  //'node/shebang': 'on',
  // --
}

const tsRules = {
  ...commonRules,
  'tsdoc/syntax': 'warn',
}

const tsxRules = {
  ...tsRules,
  ...graphqlRules,
}

// Plugins
////////////////////////////////////////////////////////////////////////////////

// TODO(vjpr): Should we use `@graphql-eslint/eslint-plugin` instead of the one from Apollo?
const commonPlugins = ['babel', 'react', 'import', 'graphql']

const typescriptPlugins = [
  '@typescript-eslint/eslint-plugin',
  'eslint-plugin-tsdoc',
  ...commonPlugins,
]

const jestPlugins = ['jest', ...typescriptPlugins]

// Extends
////////////////////////////////////////////////////////////////////////////////

const commonExtends = [
  'eslint:recommended',
  'plugin:react/recommended',
  'plugin:import/errors',
  'plugin:import/warnings',
  'plugin:react-hooks/recommended',
  'plugin:node/recommended',
  'plugin:eslint-comments/recommended',
]

const prettierExtends = [
  // Don't report on formatting issues that prettier will fix.
  // NOTE: Make sure it is last to override other configs.
  'prettier',
  'prettier/@typescript-eslint',
  'prettier/babel',
  'prettier/react',
]

const typescriptExtends = [
  ...commonExtends,
  'plugin:@typescript-eslint/eslint-recommended',
  'plugin:@typescript-eslint/recommended',
  ...prettierExtends,
]

const javascriptExtends = [...commonExtends, ...prettierExtends]

const jestExtends = [...commonExtends, 'plugin:jest/recommended']

// Settings
////////////////////////////////////////////////////////////////////////////////

// NOTE: Synced with: `babel-preset-live-node-basic` + `eslint-config-live` + `tsconfig-pkg`.
const babelModuleSettings = {
  cwd: 'packagejson',
  root: ['./src'],
  alias: {
    '^modules/(.+)': './src/modules/\\1',
    '^@src/(.+)': './src/\\1',
  },
  // NOTE: This is only needed for eslint. We need to look for `ts` and `tsx`
  //   files because we are only checking for their existence but they won't be
  //   transpiled yet.
  extensions: ['.js', '.jsx', '.ts', '.tsx'],
}

const settings = {
  react: {version: 'detect'},
  'import/resolver': {
    'babel-module': babelModuleSettings,
  },
}

// Env
////////////////////////////////////////////////////////////////////////////////

const env = {
  es6: true,
  node: true,
  browser: true,
  // See https://stackoverflow.com/a/50513752/130910.
  webextensions: true,
}

////////////////////////////////////////////////////////////////////////////////

const typescriptOverride = {
  files: ['**/*.ts', '**/*.tsx'], // We handle tsx separately because of graphql.
  //files: ['**/*.ts'],
  env,
  plugins: typescriptPlugins,
  extends: typescriptExtends,
  rules: tsRules,
  settings,
  // NOTE: Why use this `typescript-eslint` over `babel-eslint`?
  //  This supports creating rules based on type information, which is not available to babel because there is no type-checker.
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {jsx: true},
    ecmaVersion: 2018,
    sourceType: 'module',
    //project: 'tsconfig.json',
  },
}

// For graphql.
const tsxOverride = {
  ...typescriptOverride,
  rules: tsxRules,
  files: ['**/*.tsx'],
}

//eslint-disable-next-line no-undef
module.exports = {
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
    ecmaVersion: 2020, // To support `nullishCoalescingOperator`. See: https://stackoverflow.com/questions/57378411/eslint-fails-to-parse-and-red-highlights-optional-chaining-and-nullish-coal
  },
  plugins: commonPlugins,
  extends: javascriptExtends,
  rules: commonRules,
  settings,
  env,
  globals: {
    // NOTE: Not working.
    chrome: true,
  },
  overrides: [
    typescriptOverride,
    // Jest tests.
    {
      ...typescriptOverride,
      files: ['**/jest.setup.js', '**/*.test.js', '**/*.test.ts'],
      env: {...env, jest: true},
      plugins: jestPlugins,
      extends: jestExtends,
      // Workaround for the "extend in overrides" now natively support by ESLint.
      // TODO(vjpr): Maybe we can use this form to get our plugins inside your org eslint config.
      //...require('eslint-plugin-jest').configs.recommended,
      // --
    },
    // TSX is handled separately because `eslint-graphql-plugin` needs to find a `.graphqlconfig`.
    //tsxOverride,
  ],
}
