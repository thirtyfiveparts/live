import cypress from 'cypress'
import findPackages from '@pnpm/find-workspace-packages'
import '@pnpm/logger' // peer dep
import 'find-packages'
import _ from 'lodash'
import globby from 'globby'
import to from 'await-to'
import getPort from 'get-port'
import path, {join} from 'path'
import dotenv from 'dotenv'
import fs from 'fs-extra'

const fileServerFolder = 'test/e2e/cypress'
const cypressFolder = 'test/e2e/cypress'
const defaultConfig = {
  fileServerFolder,
  fixturesFolder: join(cypressFolder, 'fixtures'),
  integrationFolder: join(cypressFolder, 'integration'),
  pluginsFile: join(cypressFolder, 'plugins/index.js'),
  screenshotsFolder: join(cypressFolder, 'screenshots'),
  supportFile: join(cypressFolder, 'support/index.js'),
  videosFolder: join(cypressFolder, 'videos'),

  video: false,
}

////////////////////////////////////////////////////////////////////////////////

export async function cypressOpen() {
  const pkgsWithCypressTests = await getPkgsWithCypressTests()

  for (const pkg of pkgsWithCypressTests) {
    const port = getDevPortFromPkg(pkg)
    const baseUrl = `http://localhost:${port}`
    await openTest(pkg, pkg.deps, baseUrl)
  }
}

async function openTest(pkg, deps, baseUrl) {
  const project = pkg.dir

  const opts = {
    // Use single Cypress instance for all runs.
    global: true,
    project,
    watchForFileChanges: true,
    config: {
      baseUrl,
      ...defaultConfig,
    },
  }

  const [err, result] = await to(cypress.open(opts))
  if (err) {
    console.error(err.message)
    process.exit(1)
  }
}

////////////////////////////////////////////////////////////////////////////////

export async function cypressRun() {
  const pkgs = await getPkgs()
  const pkgsWithCypressTests = await getPkgsWithCypressTests()

  for (const pkg of pkgsWithCypressTests) {
    const port = getDevPortFromPkg(pkg)
    const baseUrl = `http://localhost:${port}`
    await runTest(pkg, pkg.deps, baseUrl)
  }
}

////////////////////////////////////////////////////////////////////////////////

async function runTest(pkg, deps, baseUrl) {
  const logger = console

  // Start dependent projects.

  const processes = startDependentServices({logger, deps})

  // Run tests.

  // TODO(vjpr): This is outdated. Don't use `testFiles`.
  const tests = globby.sync('src/cypress/integration/**/*.{js,ts}', {
    cwd: pkg.dir,
    absolute: true,
  })

  if (!tests.length) {
    console.log('No tests found.')
  } else {
    console.log('Tests found')
    console.log({tests})
  }

  const project = pkg.dir

  // TODO(vjpr): Check if `slice` is getting the right arguments.
  //const cliRunOpts = await cypress.cli.parseRunArguments(process.argv.slice(2))
  const cliRunOpts = {}

  let runOpts = {
    testFiles: tests,
    project,
    reporter: 'junit',
    config: {
      // Where the client is hosted. Prefixed to `cy.visit()` commands.
      baseUrl,
      nodeVersion: 'system',
      watchForFileChanges: false,
      ...defaultConfig,
    },
  }

  runOpts = {...runOpts, cliRunOpts}

  const [err, result] = await to(cypress.run(runOpts))
  if (err) {
    console.error(err.message)
    process.exit(1)
  }

  // Kill processes.

  for (const process of processes) {
    console.log('Killing process', process.name)
    await process.app.shutdown?.()
  }

  console.log({result})

  // Handle Cypress failure.
  if (result.failure) {
    console.error('Could not execute tests')
    console.error(result.message)
    process.exit(result.failures)
  }

  process.exit(result.totalFailed)

  return result
}

////////////////////////////////////////////////////////////////////////////////

async function getPkgs() {
  const workspaceRoot = getRepoRoot()
  const opts = {
    engineStrict: false,
    patterns: undefined,
  }
  const pkgs = await findPackages(workspaceRoot, opts)
  return pkgs
}

async function getPkgsWithCypressTests() {
  const pkgs = await getPkgs()
  const pkgsWithCypressTests = pkgs.filter(p => {
    return p.manifest.live?.cypress
  })
  for (const pkg of pkgs) {
    pkg.deps = resolveDeps(pkg, pkgs)
  }
  return pkgsWithCypressTests
}

function resolveDeps(pkg, pkgs) {
  const deps = []
  const dependencies = pkg.manifest.live?.dependencies ?? []
  for (const [depPkgName] of Object.entries(dependencies)) {
    console.log('Resolving dep', depPkgName)
    const depPkg = _(pkgs).find(p => _.get(p, 'manifest.name') === depPkgName)
    const path = require.resolve(depPkg.dir)
    deps.push({name: depPkgName, path})
  }
  return deps
}

async function startDependentServices({logger, deps}) {
  const processes = []
  console.log('Starting dependent projects')
  for (const depPkg of deps) {
    console.log('Starting service', {depPkg})
    const getApp = require(depPkg.path).default
    const app = await getApp({logger})
    const port = await getPort({port: getPort.makeRange(3010, 3100)})
    const listener = await app.listen(port)
    const host = 'http://localhost'
    logger.info(`🚀  Server ready at ${host}:${port}`)
    // NOTE: To access port we need to use: `listener.address().port`.
    processes.push({app, port, name: depPkg.name})
  }
  return processes
}

function getRepoRoot() {
  const findUp = require('find-up')
  const path = require('path')
  const rootPath = findUp.sync('pnpm-workspace.yaml', {cwd: process.cwd()})
  const repoRoot = path.dirname(rootPath)
  return repoRoot
}

// Read the `.env` file to see what port it will be running on.
//   This won't work if the env var was manually set.
// TODO(vjpr): Look for running processes?
//   Prompt to start if not running.
function getDevPortFromPkg(pkg) {
  const pkgEnvFilePath = join(pkg.dir, '.env')
  if (!fs.existsSync(pkgEnvFilePath)) {
    console.error(`'.env' file in ${pkg.dir} not found. Cannot infer PORT`)
    process.exit(1)
  }
  const envConfig = dotenv.parse(fs.readFileSync(pkgEnvFilePath))
  const defaultPort = 3000
  return envConfig.PORT ?? defaultPort
}
