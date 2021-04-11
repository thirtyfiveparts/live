// NOTE: If you modify this file you must touch `wallaby.ava.js`.

const {join} = require('path')
const path = require('path')
const babelCompiler = require('./babel/compiler')
const readPkg = require('read-pkg')
const c = require('chalk')
const yargsParser = require('yargs-parser')

const {getTransitiveDependenciesSync} = require('get-workspace-pkgs-sync')

////////////////////////////////////////////////////////////////////////////////

// Wallaby uses many worker processes which each eval this file.
// We want to cache some things only on the first run.

console.log('Loading wallaby config')

// DEBUG
console.log('Wallaby script args:' + process.argv)

// TODO(vjpr): Double check this.
const isWallabyWorkerProcess = process.argv[2] === 'worker'

////////////////////////////////////////////////////////////////////////////////
module.exports = overrides => w => {

  // Read from `tmp/wallaby.env` file.
  // This is generated by IntelliJ Run Configuration as workaround for: https://github.com/wallabyjs/public/issues/2448
  require('dotenv').config({path: './tmp/wallaby.env'})
  const args = yargsParser(process.env.WALLABY_OPTS)
  // --

  let pkgDirs = []
  const repoRoot = w.localProjectDir // This is the *github* repo root.

  const [selectedWallabyDir, packageFilter] = args._
  let rootDir
  // `selectedWallabyDir` is useful so we can run only its tests, but bring in all other packages.
  //   This is why we can't just rely on filter alone I think. Actually maybe we could.
  if (selectedWallabyDir) {
    const relPkgDir = selectedWallabyDir ?? '' // repo root as default.
    const absPkgDir = join(repoRoot, selectedWallabyDir)

    console.log(`process.env.WALLABY_OPTS=${process.env.WALLABY_OPTS}`)
    console.log(`wallaby.localProjectDir=${w.localProjectDir}`)

    // NOTE: We run on all packages under the directory.
    //const pjson = readPkg.sync({cwd: absPkgDir})
    //console.log(
    //  `Running wallaby only for package '${pjson.name}' and its transitive workspace dependencies.`,
    //)
    // --
    console.log(
      `Running wallaby only for packages inside '${absPkgDir}' and its transitive workspace dependencies.`,
    )
    ////////////////////

    const pkgName = undefined
    const parentDir = absPkgDir
    const filter = packageFilter // pnpm filtering syntax: https://pnpm.js.org/en/filtering

    // TODO(vjpr): PERF - This is expensive. It will run for every worker! Cache to disk!
    const depsMap = getTransitiveDependenciesSync(absPkgDir, filter, pkgName, parentDir, {
      // NOTE: We cannot share a cacheKey across multiple worker processes so we only keep one entry in the cache at any time.
      customCacheKey: 'default',
      useDiskCache: true,
      forceInvalidate: !isWallabyWorkerProcess,
    })
    pkgDirs = Object.keys(depsMap)
    // I don't think we need to do this anymore because we use `excludeSelf: false`.
    //pkgDirs.push(absPkgDir) // Add selected package.
    // --
    rootDir = relPkgDir // This is used for allowing us to only run a selected packages tests.
  } else {
    rootDir = ''
    pkgDirs.push('') // All
  }

  // Relative dirs.
  const dirs = pkgDirs.map(pkgDir => path.relative(repoRoot, pkgDir))

  const includeDepTests = false

  // TODO(vjpr): In future we may need to read some config from the package dir.

  function prefixAllPatternsWithDirs(patterns, relDirs) {
    return relDirs.map(dir => patterns.map(p => join(dir, p))).flat()
  }

  // Exts - glob pattern

  // TODO(vjpr): Remove `bin` and make it easier to customize the config!
  const extsArr = ['js', 'jsx', 'ts', 'tsx', 'bin']
  const exts = '{' + extsArr.join(',') + '}' // E.g. `{js,ts}`

  // Ignores

  const filesIgnore = [
    `**/src/**/*.test.{ava,jest}.${exts}`, // Ava tests
    `**/src/**/*.test.${exts}`, // Jest tests
    '**/node_modules/**',
    `.dev/**`, // Root dev scratch dir
    `.git/**`, // Root dev scratch dir
    `**/.dev/**`, // Nested dev scratch dirs
  ].map(p => '!' + p)

  const testsIgnore = ['**/node_modules/**'].map(p => '!' + p)

  // Files

  const filesInclude = prefixAllPatternsWithDirs(
    [
      // OUTDATED: To do it in one line you must use `**/src/{*.js,**/*.js}` but it is much harder to read.
      //`src/*.${exts}`,
      `src/**/*.${exts}`,
      //`**/src/**/*.${exts}`,
    ],
    dirs,
  )

  const filesIncludeExtra = [
    // TODO(vjpr): We need `tools` in the root dir too. And probably all files really.
    //'**/*.ts',
    //'**/src/**/*.ts',
    //'**/package.json',
    // --
    {pattern: 'babel.config.js', instrument: false, load: false},
    'shrinkwrap.yaml',
  ]
  filesInclude.push(...filesIncludeExtra)

  const testsInclude = prefixAllPatternsWithDirs(
    [
      // Needed if WALLABY_OPTS is like `repos/foo/packages/app/foo`.
      //`src/*.test.ava.${exts}`,
      `src/**/*.test.ava.${exts}`,
      // --
      // Needed if WALLABY_OPTS is like `repos/foo`.
      //`**/src/*.test.ava.${exts}`,
      `**/src/**/*.test.ava.${exts}`,
      // --
      // Skip e2e tests because they encounter rate-limiting.
      '!**/src/**/*.e2e.test.ts',
    ],
    includeDepTests ? dirs : [rootDir],
  )

  const out = {
    files: [...filesInclude, ...filesIgnore],

    tests: [...testsInclude, ...testsIgnore],

    env: {
      type: 'node',
    },

    compilers: {
      //'**/*.js?(x)': w.compilers.babel({}),
      //'**/*.ts?(x)': w.compilers.typeScript({
      //  module: 'commonjs',
      //}),
      '**/*.ts': babelCompiler(w),
    },

    preprocessors: {
      '**/package.json': packageJsonProcessor(w),
    },

    testFramework: 'ava',

    debug: true,

    runMode: 'onsave',

    setup: w => {
      global.wallaby = w
      global.wallabySessionId = w.sessionId
      global.wallabyWorkerId = w.workerId
    },

    workers: {
      // TODO(vjpr): Add type checks.
      ...args.workers ?? {},
    },

    ...overrides,

    reportConsoleErrorAsError: false,

    //reportUnhandledPromises: false,
  }

  // Only print config for first process.
  if (!isWallabyWorkerProcess) console.log(out)

  return out
}

////////////////////////////////////////////////////////////////////////////////

// In `package.json#main` `.ts` -> `.js`.
// Needed because even if we don't use it, Node resolver seems to check the file exists.
function packageJsonProcessor(wallaby) {
  return file => {
    const pjson = JSON.parse(file.content)
    if (pjson.main) {
      pjson.main = pjson.main.replace('.ts', '.js')
    }
    return JSON.stringify(pjson, null, 2)
  }
}

////////////////////////////////////////////////////////////////////////////////

function getPackageDependencies() {}
