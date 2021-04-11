import {codegen} from '@graphql-codegen/core'
import {Watcher} from './watcher/watchman'
import _ from 'lodash'
import {UrlLoader} from '@graphql-tools/url-loader'
import {loadDocuments, loadSchema} from '@graphql-tools/load'
import to from 'await-to'
import {
  getWorkspacePackages,
  getPackageDirFromName,
  getRepoRoot, getRepoRootCached,
} from '@live/get-workspace-pkgs'
import c from 'chalk'
import path, {join} from 'path'
import {printSchema, parse, GraphQLSchema, GraphQLError} from 'graphql'
import fse from 'fs-extra'
import prettier from 'prettier'

import debouncePromise from 'debounce-promise'

import {CodeFileLoader} from '@graphql-tools/code-file-loader'

import {GraphQLFileLoader} from '@graphql-tools/graphql-file-loader'
import {getGraphQLProjectConfig} from 'graphql-config'
import notifier from 'node-notifier'
import tildify from 'tildify'
//import pDebounce from 'p-debounce'

let watcher

let errorsLastRun = false

let prettierConfig

export default async function () {
  const root = getRepoRoot()

  // Prettier config
  let prettierConfigFile = await prettier.resolveConfigFile(root)
  prettierConfig = await prettier.resolveConfig(prettierConfigFile)

  // Watch all tsx files, look for `gql` tags, and generate types for the Apollo queries.
  watcher = new Watcher('graphql-codegen', ['.tsx'], root)
  await watcher.init()
  let firstRun = true
  const debouncedRun = debouncePromise(run) // Runs on trailing edge of interval by default.
  watcher.onChange(async changedFiles => {
    // Filter
    changedFiles = changedFiles.filter(f => !f.name.endsWith('.gen.tsx'))
    if (!changedFiles.length) return

    let allFiles = await watcher.query()
    allFiles = allFiles.filter(f => !f.name.endsWith('.gen.tsx'))

    debouncedRun({allFiles, changedFiles, firstRun, root}).then()
    firstRun = false
  })
}

process.on('exit', () => {
  //watcher.end()
})

////////////////////////////////////////////////////////////////////////////////

async function run({allFiles, changedFiles, firstRun, root}) {
  //console.log(changedFiles.length, ' files changed')
  //console.log(allFiles.length)

  console.log('Files changed...updating.')

  if (!firstRun) {
    let str = ''
    //changedFiles
    changedFiles.map(f => (str += `Changed: ${c.blue(f.name)}\n`))
    console.log(str)
  }

  // TODO(vjpr): What changed? Limit the amount of work we have to do.
  // Schema - Regenerate everything.
  // TSX - Rebuild only this package's operations (use cache of all parsed Documents).
  //   Can we also use caching in the plugins somehow.

  const reload = changedFiles
    .map(f => f.name.includes('package.json'))
    .some(Boolean)
  // reload - takes into account added/removed package.json files.
  const pkgs = await getWorkspacePackages({reload})

  const errorsByApi = []

  const clientConfigs = {}

  const apis = await getApis({pkgs})

  console.log('Using apis', apis)

  // Generate files.
  for (const api of apis) {

    console.log(c.bold(`API: ${api.pkgName}`))

    const errors = await processApi({
      api,
      allFiles,
      changedFiles,
      root,
      clientConfigs,
    })
    errorsByApi.push({apiName: api.pkgName, errors: errors ?? []})
  }

  // We generate `.graphqlconfig` for every package using an api.
  // web/.graphqlconfig

  for (const [depDir, config] of Object.entries(clientConfigs)) {
    const filename = '.graphqlconfig'
    const outputFile = join(depDir, filename)
    const output = JSON.stringify(config, null, 2)
    writePretty(outputFile, output, 'json')
  }

  ////////////////////

  // NOTE: We generate a root file for eslint to use.
  // <repo-root>/.graphqlconfig
  await generateRootGraphqlConfigFile({apis, root})

  // Print errors last and only if we have errors.
  const totalErrors = errorsByApi.reduce(
    (acc, {errors}) => acc + errors.length,
    0,
  )

  if (!totalErrors) {
    if (errorsLastRun) {
      notifier.notify({
        title: 'Live graphql generator',
        message: `✅ Errors fixed!`,
        wait: false,
      })
    }
    errorsLastRun = false
    return
  }

  errorsLastRun = true

  console.log('Errors occurred:')
  notifier.notify({
    title: 'Live graphql generator',
    message: `🔴 ${totalErrors} errors`,
    wait: false,
  })
  for (const {apiName, errors} of errorsByApi) {
    if (!errors.length) continue
    console.log(c.bold('While processing api: ' + apiName))
    printErrors(errors)
  }
}

////////////////////////////////////////////////////////////////////////////////

function handleCouldNotFindPackageDir(pkgName) {
  console.warn(
    c.yellow(
      `WARNING: Could not find package dir for package name '${pkgName}'`,
    ),
  )
}

////////////////////////////////////////////////////////////////////////////////

async function getPkgFromPkgName(pkgName) {
  const pkgs = await getWorkspacePackages()
  const pkg = _.find(pkgs, p => p.manifest.name === pkgName)
  return pkg
}

async function processApi({api, allFiles, root, changedFiles, clientConfigs}) {
  const pkg = await getPkgFromPkgName(api.pkgName)
  if (!pkg.dir) {
    handleCouldNotFindPackageDir(api.pkgName)
    return
  }

  // Get schema.
  //const schema = await loadSchema(api.endpoint, {
  //  loaders: [new UrlLoader()],
  //})
  // NOTE: We are writing the schema to disk on server start.
  const schemaPath = join(pkg.dir, 'schema.graphql') // TODO: This must be synced.
  console.log(c.cyan(`Load schema from disk: ${rootify(schemaPath)}`))
  const schema = await loadSchema(schemaPath, {
    loaders: [new GraphQLFileLoader()],
  })
  const schemaName = api.schemaName

  let errors = []

  // NOTE: Our api server create this file for us now.
  // @foo/schema/schema.graphql
  //await generateSchemaGraphqlFile({pkg, schema, schemaName, errors})

  // @foo/schema/types.d.ts
  await generateSchemaTypesFile({pkg, schema, schemaName, errors})

  // web/src/__generated__/graphql-codegen/index.gen.tsx
  await generateApolloTypes({
    pkg,
    schema,
    schemaName,
    allFiles,
    changedFiles,
    root,
    errors,
  })

  // .graphqlconfig

  // NOTE: Files are written outside this function.
  // web/.graphqlconfig
  await generateGraphqlClientConfigFiles({
    pkg,
    schema,
    schemaName,
    clientConfigs,
  })

  // @foo/schema/.graphqlconfig
  await generateGraphqlConfigFileForSchema({pkg, schema, schemaName})

  return errors
}

////////////////////////////////////////////////////////////////////////////////

function printErrors(errors) {
  for (const err of errors) {
    if (err.pretty) return console.error(err.pretty)
    console.error(err)
  }
}

////////////////////////////////////////////////////////////////////////////////

async function generateGraphqlConfigFileForSchema({pkg, schema, schemaName}) {
  const filename = '.graphqlconfig'
  const outputFile = join(pkg.dir, filename)
  const config = {
    name: pkg.manifest.name,
    schemaPath: './schema.graphql',
    extensions: {
      ...getGraphqlExtensionsConfig(schemaName),
    },
  }
  const output = JSON.stringify(config, null, 2)
  writePretty(outputFile, output, 'json')
}

////////////////////////////////////////////////////////////////////////////////

// NOTE: This is an odd way of doing this, but I wanted to not spend much time on it so I just pass in an object and mutate it.
//   Maybe better to map.

// This is for `js-graphql-intellij-plugin`
// See: https://jimkyndemeyer.github.io/js-graphql-intellij-plugin/docs/developer-guide#setting-up-multi-schema-projects-using-graphql-config
async function generateGraphqlClientConfigFiles({
  pkg,
  schema,
  schemaName,
  clientConfigs,
}) {
  // TODO(vjpr): Lookup using service discovery or something.
  const url = 'http://localhost:3000/graphql'

  // Packages that depend on the `@foo/foo.schema`.
  const apiDependents = await findDependents(pkg.manifest.name)

  for (const dep of apiDependents) {
    const absSchemaPath = join(pkg.dir, 'schema.graphql')
    const relSchemaPath = path.relative(dep.dir, absSchemaPath)
    const project = {
      schemaPath: relSchemaPath,
      // Maybe we should use projects and separate all gql calls into
      //   separate folders depending on which api they are calling.
      includes: ['**/*.tsx'],
    }
    const endpoint = getGraphqlExtensionEndpoint({schemaName, url})

    // Add to config dictionary - so we can support multiple apis per package.
    const existingConfig = clientConfigs[dep.dir]
    if (!existingConfig) {
      clientConfigs[dep.dir] = {
        name: dep.manifest.name,
        projects: {},
        extensions: {
          endpoints: {},
        },
      }
    }
    clientConfigs[dep.dir].projects[pkg.manifest.name] = project
    clientConfigs[dep.dir].extensions.endpoints[pkg.manifest.name] = endpoint
  }
}

////////////////////////////////////////////////////////////////////////////////

function getGraphqlExtensionEndpoint({schemaName, url}) {
  const config = {
    [schemaName]: {
      url,
      headers: {
        'user-agent': 'JS GraphQL',
      },
      introspect: false,
    },
  }
  return config
}

function getGraphqlExtensionsConfig({schemaName, url}) {
  const config = {
    endpoints: {
      [schemaName]: {
        url,
        headers: {
          'user-agent': 'JS GraphQL',
        },
        introspect: false,
      },
    },
  }
  return config
}

////////////////////////////////////////////////////////////////////////////////

async function generateRootGraphqlConfigFile({apis, root}) {
  const outputFile = join(root, '.graphqlconfig')
  const projects = {}
  for (const api of apis) {
    const pkg = await getPkgFromPkgName(api.pkgName)
    const apiDependents = await findDependents(pkg.manifest.name)
    const includes = apiDependents.map(dep => {
      return path.relative(root, dep.dir) + '/**/*.tsx'
    })
    const absSchemaPath = join(pkg.dir, 'schema.graphql')
    const schemaPath = path.relative(root, absSchemaPath)
    projects[api.schemaName] = {
      schemaPath,
      includes,
    }
  }
  const config = {
    projects,
  }
  const output = JSON.stringify(config, null, 2)
  writePretty(outputFile, output, 'json')
}

////////////////////////////////////////////////////////////////////////////////

// Generates a `schema.graphql` file for IntelliJ plugin to work.
// For https://jimkyndemeyer.github.io/js-graphql-intellij-plugin/
async function generateSchemaGraphqlFile({pkg, schema, schemaName, errors}) {
  // TODO(vjpr): Doesn't need to be named core. Just schema should be fine.
  const filename = `schema.graphql`
  const outputFile = join(pkg.dir, filename)
  const config = {
    filename: outputFile,
    schema: parse(printSchema(schema)),
    plugins: [{schemaAst: {includeDirectives: true}}],
    pluginMap: {
      schemaAst: await import('@graphql-codegen/schema-ast'),
    },
  }
  const output = await safeCodegen(config, errors)
  if (!output) return
  writePretty(outputFile, output, 'graphql')
}

////////////////////////////////////////////////////////////////////////////////

async function generateSchemaTypesFile({pkg, schema, errors}) {
  const filename = 'types.d.ts'
  const outputFile = join(pkg.dir, filename)
  const config = {
    filename: outputFile,
    schema: parse(printSchema(schema)),
    plugins: [{typescript: {}}],
    pluginMap: {
      typescript: await import('@graphql-codegen/typescript'),
    },
  }
  const output = await safeCodegen(config, errors)
  if (!output) return
  writePretty(outputFile, output)
}

////////////////////////////////////////////////////////////////////////////////

async function generateApolloTypes({
  pkg,
  schema,
  schemaName,
  allFiles,
  changedFiles,
  root,
  errors,
}) {
  // Packages that depend on the `@foo/foo.schema`.
  const apiDependents = await findDependents(pkg.manifest.name)

  const schemaPkgName = pkg.manifest.name

  for (const dep of apiDependents) {
    let documents = await getDocuments({
      dep,
      root,
      allFiles,
      changedFiles,
      errors,
      schemaPkgName,
    })

    // We may not need this anymore because we only get documents whose gql tags are imported from the schema files.
    //documents = filterDocumentsForApi({documents, schemaPkgName})
    // --

    // TODO(vjpr): We should clear this dir before we do any writing...incase a schema is renamed or something.
    const outDir = `src/__generated__/graphql-codegen/`
    const filename = join(outDir, `${schemaName}.gen.tsx`)
    // --
    const outputFile = join(dep.dir, filename)
    const config = {
      filename: outputFile,
      schema: parse(printSchema(schema)),
      // NOTE: We should only pass documents for this api or we get errors.
      documents,
      plugins: [{ts: {}}, {tsOperations: {}}, {tsReactApollo: {}}],
      pluginMap: {
        ts: await import('@graphql-codegen/typescript'),
        tsOperations: await import('@graphql-codegen/typescript-operations'),
        tsReactApollo: await import('@graphql-codegen/typescript-react-apollo'),
      },
    }
    const output = await safeCodegen(config, errors)
    if (!output) return
    writePretty(outputFile, output)
  }
}

////////////////////////////////////////////////////////////////////////////////

async function findDependents(pkgName) {
  const pkgs = await getWorkspacePackages()
  const dependents = _.filter(pkgs, p =>
    Object.keys(p.manifest.dependencies ?? {}).includes(pkgName),
  )
  return dependents
}

////////////////////////////////////////////////////////////////////////////////

function writePretty(outputFile, output, parser = 'babel-ts') {
  const prettyOutput = prettier.format(output, {...prettierConfig, parser})

  // Check if contents is different.
  const existingContents = fse.readFileSync(outputFile, 'utf8')
  const fileChanged = existingContents !== prettyOutput
  // --

  const colorFn = fileChanged ? c.green : c.grey
  const action = fileChanged ? 'Write' : 'Skip'
  const msg = colorFn(`${action}: ${rootify(outputFile)}`)
  console.log(msg)

  if (!fileChanged) return
  fse.outputFileSync(outputFile, prettyOutput)
}

////////////////////////////////////////////////////////////////////////////////

const documentsCache = {}

async function getDocuments({
  dep,
  root,
  allFiles,
  changedFiles,
  errors,
  schemaPkgName,
}) {
  // TODO(vjpr): Maybe find a better way than just `replace`. Could run into problems with symlinking or such.
  const rootRelativeDepDir = dep.dir.replace(root + '/', '')
  // Files within this dep.
  const depFiles = filterFilesInPkg(allFiles, rootRelativeDepDir)
  const depChangedFiles = filterFilesInPkg(changedFiles, rootRelativeDepDir)
  let documents = []
  for (const f of depFiles) {
    const [err, doc] = await processDocumentFile(
      f,
      depChangedFiles,
      schemaPkgName,
    )
    if (err) {
      errors.push(err)
      continue
    }
    if (!doc) continue
    //const fullPath = join(root, doc.location)
    documents.push(doc)
  }
  return documents
}

function filterFilesInPkg(files, rootRelativeDepDir) {
  return files.filter(f => f.name.startsWith(rootRelativeDepDir))
}

async function processDocumentFile(f, depChangedFiles, schemaPkgName) {
  const name = f.name
  // Simple caching.
  const fileHasChanged = depChangedFiles.find(f => f.name === name)
  const cachedDocument = documentsCache[name]
  if (fileHasChanged || !cachedDocument) {

    ////////////////////
    // See: https://www.graphql-tools.com/docs/loaders/#code-file-loader
    // Issue: https://github.com/ardatan/graphql-tools/issues/2635
    // We only parse `gql` tags from our `schemaPkgName` and ignore others.
    const codeFileLoaderOpts = {
      pluckConfig: {
        modules: [{
          name: schemaPkgName,
          identifier: 'gql',
        }],
      },
    }
    const codeFileLoader = new CodeFileLoader()
    ////////////////////

    const [err, docs] = await to(
      loadDocuments(name, {
        loaders: [codeFileLoader],
        ...codeFileLoaderOpts,
        //cache: {}, // TODO(vjpr): Maybe we can use this - although I think I want more control.
      }),
    )

    if (err) {
      return handleLoadDocumentError(err, name)
    }
    // We process one at a time.
    const doc = docs[0]
    documentsCache[name] = doc
    return [null, documentsCache[name]]
  } else {
    return [null, cachedDocument]
  }
}

function handleLoadDocumentError(err, name) {
  if (err.toString().match('Unable to find any GraphQL')) return []
  if (err instanceof GraphQLError) {
    let msg = ''
    msg += c.red.bold(`${name}:\n`)
    msg += c.red.bold('An error was found parsing your GraphQL code\n')
    msg += c.red(err.toString())
    err.pretty = msg
    return [err]
  }
  if (err.toString().match('SyntaxError')) {
    let msg = ''
    msg += c.red.bold(`${name}:\n`)
    msg += c.red.bold('An error was found parsing your code\n')
    msg += c.red(err.stack)
    err.pretty = msg
    return [err]
  }
  throw err
}

async function safeCodegen(arg, errors) {
  try {
    return await codegen(arg)
  } catch (e) {
    e.pretty = c.red(e.toString())
    errors.push(e)
  }
}

/*
For a schema (package containing schema.gql),
get all documents (gql blocks) that access it.

We need to consider:
- eslint-plugin-graphql
  - https://github.com/apollographql/eslint-plugin-graphql/issues/84
- js-graphql-intellij-plugin
  - Only detects `gql`, custom tags must use `// language=GraphQL`.
    See: https://github.com/jimkyndemeyer/js-graphql-intellij-plugin/issues/294#issuecomment-545523768
- refactoring

Our options are:
- custom tag
- comment (# schema: @foo/bar)
  - this is not so great if we rename the schema...lots of string renames.

We need to only run codegen on documents for the api we are currently processing
  or we get errors.
*/
function filterDocumentsForApi({documents, schemaPkgName}) {
  return documents.filter(doc => {
    // Comment-based approach.
    const preamble = '# schema: '
    if (doc.rawSDL.startsWith(preamble)) {
      return doc.rawSDL.startsWith(preamble + schemaPkgName)
    }
    ////////////////////
    // Use default api for this document location.
    //doc.location
    // TODO(vjpr): For now, we require schema to be specified.
    let msg = 'All queries must specify a schema as a comment.\n'
    msg += doc.location + '\n'
    msg += c.grey(doc.rawSDL + '\n')
    throw new Error(c.red(msg))
  })
}

async function getApis({pkgs}) {
  //const apis = [
  //  //{pkgName: '@live/app-templates.full-stack.api'},
  //  // TODO(vjpr): Get endpoint from some config file.
  //  //   Load from pkgs.
  //  {
  //    pkgName: '@sidekicks/backend.schema',
  //    schemaName: 'sidekick', // For naming files.
  //    endpoint: 'http://localhost:3010/graphql',
  //  },
  //  {
  //    pkgName: '@sidekicks/chrome-extension-graphql-schema',
  //    schemaName: 'sidekick-chrome-extension', // For naming files.
  //    endpoint: 'http://localhost:3010/graphql',
  //  },
  //]

  return pkgs
    .filter(p => p.manifest.live?.['graphql-codegen'])
    .map(p => {
      const schemaName = p.manifest.live?.['graphql-codegen'].schemaName
      // TODO(vjpr)
      const dummyEndpoint = 'http://localhost:3010/graphql'
      // --
      return {pkgName: p.manifest.name, schemaName, endpoint: dummyEndpoint}
    })
}

function rootify(p) {
  const root = getRepoRootCached()
  return path.relative(root, p)
}
