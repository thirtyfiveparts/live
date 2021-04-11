import {
  printRunnableCommand,
  printRunnableCommands,
  printRunnableCommandsOfType,
  printFeatureCommands,
} from '../printers'
import path, {join} from 'path'
import _ from 'lodash'
import Debug from 'debug'
import fs from 'fs'
import flat from 'flat'
import c from 'chalk'
import indent from 'indent-string'

const debug = Debug('@live/cli')

export function collectCommands({project, repoRoot, ctx}) {
  ctx = ctx || {}
  const cwd = process.cwd() // TODO(vjpr): Pass in cwd!

  const sources = getLivefileSources({project, repoRoot, ctx})

  // TODO(vjpr): Sort by priority and clean duplicates.
  const commands = _.flatMapDeep(sources, source => {
    // Returns an object.
    // sourceCommandResp = {livefile, source, sourcePath}
    const sourceCommandResp = source.getCommands({
      p: source.p,
      source: source.name,
    })
    const livefile = sourceCommandResp?.livefile || {}
    /*
    livefile:

    {
      foo: 'echo foo',
      bar: {script: 'echo bar'},
      appTypeLiveNextJs: { baz: () => {} },
    }
    */
    return Object.entries(livefile).map(([key, val]) => {
      // NOTE: Command filtering is done in `isCommandAvailableForCurrentPackage`.

      const commandType = key

      if (commandType === 'feature') {
        return _.map(val, (v, featureName) =>
          processCommands(v, featureName, commandType),
        )
      }

      if (
        commandType.startsWith('appType') ||
        ['package', 'app', 'feature', 'repo'].includes(commandType)
      ) {
        return processCommands(val, null, commandType)
      }

      // Top-level commands in livefile.
      /*
      {
        app: {foo: () => {}},
        dev: () => {}, <- handle this
      }
      */
      return processCommands({[key]: val}, null, 'top-level')

      ////////////////////

      function processCommands(commands, featureName, commandType) {
        commands = flattenCommands(commands)

        commands = commands.map(cmd => {
          const {cmdStr, cmdFn, description, path: cmdPath} = cmd

          let name = cmdPath.join('.')

          const o = {project, featureName, commandType, cwd}
          const available = isCommandAvailableForCurrentPackage(o)
          const sourcePath = source.path
          const nameAliases = []

          // TODO(vjpr): Maybe we don't need this anymore!
          // foo should run foo.index
          // TODO(vjpr): Maybe we should support both?
          if (name.endsWith('.index')) {
            nameAliases.push(name)
            name = name.replace('.index', '')
          }
          // --

          nameAliases.push(name)

          // fooBar.bazBar -> foo-bar.baz-bar
          name = name
            .split('.')
            .map(_.kebabCase)
            .join('.')

          return {
            name,
            // TODO(vjpr): Don't allow both.
            fn: cmdFn,
            cmdStr,
            // --
            nameAliases,
            commandType,
            source,
            sourcePath,
            featureName,
            available,
          }
        })

        //console.log(commands)

        return commands
      }
    })
  })

  return commands
}

export async function printCommands({project, repoRoot, ctx, repoOnly}) {
  ctx = ctx || {}

  // TODO(vjpr): Optimize. collectCommands and getLivefileSources reads js files twice I think.
  //   There would be require.caching but maybe there is some other slowness.
  const sources = getLivefileSources({project, repoRoot, ctx})

  const commands = collectCommands({project, repoRoot, ctx})

  const commandsBySources = _(commands)
    .groupBy('source.name')
    .value()

  //for (const [sourceName, command] of Object.entries(commandsBySources)) {
  for (const source of sources) {
    const sourceCommands = commandsBySources[source.name]

    console.log(`  commands from: ${source.prettyName} (${source.p})`)

    if (!sourceCommands) {
      console.log('   <empty>')
      console.log()
      continue
    }

    const commandsByCommandType = _(sourceCommands)
      .groupBy('commandType')
      .value()

    const commandsByCommandTypeEntries = Object.entries(commandsByCommandType)
    for (let [commandType, commands] of commandsByCommandTypeEntries) {
      // What we want to print out.
      let commandTypeStr = commandType // Default.

      // TODO(vjpr): Make cli flag.
      const showAllCommands = parseInt(process.env.LIVE_CLI_SHOW_ALL_COMMANDS)

      if (repoOnly) {
        if (commandType !== 'repo') continue
      }

      if (!showAllCommands) {
        if (!repoOnly) { // TODO(vjpr): Rework this.
          commands = _.filter(commands, 'available')
        }
      }

      if (commandType === 'feature') {
        commandTypeStr = 'Commands for features used by this app'
        const commandsByFeatureName = _(commands)
          .groupBy('featureName')
          .value()
        const availableFeatures = getProjectFeatures(project)
        printFeatureCommands(
          commandTypeStr,
          commandsByFeatureName,
          availableFeatures,
        )
        continue
      }

      if (commandType.startsWith('appType')) {
        commandTypeStr = `Commands for app type (${commandType.replace(
          'appType',
          '',
        )})`
        // TODO(vjpr): Filter commands by this app type.
        printRunnableCommandsOfType(commandTypeStr, commands)
      } else if (commandType === 'app') {
        commandTypeStr = 'Commands available for all apps'
        printRunnableCommandsOfType(commandTypeStr, commands)
      } else if (commandType === 'repo') {
        commandTypeStr = 'Commands for the monorepo'
        printRunnableCommandsOfType(commandTypeStr, commands)
      } else if (commandType === 'package') {
        commandTypeStr = 'Commands for all packages'
        printRunnableCommandsOfType(commandTypeStr, commands)
      } else {
        // TODO(vjpr): This is same as commandType=package I think.
        commandTypeStr = 'Commands for all packages'
        // TODO(vjpr): We should collect these up and print together at the right indent.
        printRunnableCommandsOfType(commandTypeStr, commands)
      }
    }
    console.log()
  }
}

export function getLivefileSources({project, cmd, repoRoot, ctx, appType}) {
  const sources = [
    // /repo/packages/org/apps/app/livefile.js
    {
      name: 'app-root',
      prettyName: 'app root',
      // TODO(vjpr): Make sure `project.root` is always relative.
      p: join(repoRoot, project.root, 'livefile.js'),
      getCommands: ({name, p}) =>
        collectCommandsFromLivefile(p, {source: name, ctx}),
      // When command with same name exists, we sort by this priority.
      priority: 1,
      //fn: async ({name, p}) => await tryCommandRoot(p, {cmd, source: name, appType, ctx}),
    },
    // /repo/livefile.js
    {
      name: 'repo-root',
      prettyName: 'repo root',
      p: join(repoRoot, 'livefile.js'),
      getCommands: ({name, p}) =>
        collectCommandsFromLivefile(p, {source: name, ctx}),
      priority: 2,
      //fn: async ({name, p}) => await tryCommandRoot(p, {cmd, source: name, appType, ctx}),
    },
    // repo root default
    {
      name: 'repo-root-default',
      prettyName: 'defaults',
      p: join(__dirname, '../livefile.default.js'),
      getCommands: ({name, p}) =>
        collectCommandsFromLivefile(p, {source: name, ctx}),
      priority: 3,
      //fn: async ({name, p}) => await tryCommandRoot(p, {cmd, source: name, appType, ctx}),
    },
  ]
  return sources
}

//function collectCommandsFromRootLivefile(path, {source, key, ctx}) {
//  const livefile = tryLivefile(path, ctx)
//  if (!livefile) return null
//  //const fn = key ? livefile[key] : livefile
//  if (livefile) return {livefile, source, sourcePath: path}
//  return null
//}

function collectCommandsFromLivefile(path, {source, key, ctx}) {
  const livefile = tryLivefile(path, ctx)
  if (!livefile) return null
  //const fn = key ? livefile[key] : livefile
  if (livefile) return {livefile, source, sourcePath: path}
  return null
}

function tryLivefile(path, ctx) {
  // Need to enable babel/require because we want to support ES6 livefiles.
  // TODO(vjpr): Maybe its better to use esm or something more lightweight.
  // Or let the user do it manually.
  //require('@babel/register')
  // ---
  if (!fs.existsSync(path)) {
    // Not found.
    return null
  }
  const res = _.attempt(require, path)
  if (_.isError(res)) {
    const err = res
    if (err.code === 'MODULE_NOT_FOUND') {
      // This will occur if you import something in the livefile that cannot be found.
      const msg = `Error when requiring '${path}'`
      console.error(msg) // TODO(vjpr): Use standard error reporting function.
      throw err
    }
    if (err.toString().match(/SyntaxError/)) {
      // TODO(vjpr): If 'Unexpected token export', provide tips on fixing it. Prob babel issue.
      // Match against this: `(function (exports, require, module, __filename, __dirname) { export default function({run}) {`
      throw err
    }
    throw err
  }
  // TODO(vjpr): Return empty error.
  // TODO(vjpr): isEmpty will return true on a function. WTF.
  //if (_.isEmpty(res)) return null // empty
  // TODO(vjpr): Return invalid error.
  //if (_.isPlainObject(res)) {
  //  throw new Error(`${path} should return a function. It is returning an object.`)
  //}
  // --
  const help = (fn, desc) => {
    fn.desc = desc
    return fn
  }
  // When we are printing the commands, ctx will be {}. We need help to be provided so
  //   the user can provide descriptions.
  if (!ctx.help) ctx.help = help
  const resolvedConfig = res.default ? res.default(ctx) : res(ctx)
  return resolvedConfig
}

function getProjectFeatures(project) {
  // TODO(vjpr): Should we check the pjson to see if the dependency is present?
  return project.pjsonLiveConfig?.features
}

function projectHasFeature(project, featureName) {
  return getProjectFeatures(project)?.includes(featureName)
}

function isCommandAvailableForCurrentPackage({
  project,
  featureName,
  commandType,
  cwd,
}) {
  if (commandType === 'repo') {
    if (project.root !== cwd) return false
  }

  if (project.root === cwd) {
    if (commandType !== 'repo') return false
  }

  const isApp = project.isApp || project.isAppTemplate
  if (featureName) {
    return projectHasFeature(project, featureName)
  }
  if (commandType === 'app' && isApp) return true

  // TODO(vjpr): Should there be commands that can run on packages and not apps.
  //if (commandType === 'package') return true

  if (commandType.startsWith('appType')) {
    const appType = commandType.replace('appType', '')
    // We use dash case in pjson files.
    // TODO(vjpr): This is brittle. Maybe make it more lenient.
    // LiveNextJs => live-next-js
    if (
      _.kebabCase(project.pjsonLiveConfig?.appType) === _.kebabCase(appType)
    ) {
      return true
    }
    return false
  }
  if (commandType === 'feature') {
    return projectHasFeature(project, featureName)
  }
  return true
}

////////////////////////////////////////////////////////////////////////////////

function flattenCommands(commands) {
  // Old way.
  //commands = flat(commands, {delimiter: '.'})

  ////////////////////

  // TODO(vjpr): Maybe need to use flattenDeep or to flatten as we go.
  commands = _.flatten(process(commands))

  //printFlatCommands(commands)

  return commands

  ////////////////////

  // For each object, if it contains `script` or `description`, then
  //   we must use children.

  function process(val, opts, path = []) {
    if (!val) return null

    if (_.isString(val)) {
      return {cmdStr: val, ...opts, path}
    }

    if (_.isFunction(val)) {
      return {cmdFn: val, ...opts, path}
    }

    if (_.isPlainObject(val)) {
      if (val.script) {
        const {description} = val
        const opts = {description}
        // The command is defined as an object.
        return [
          process(val.script, opts, path),
          process(val.children, {}, path),
        ].filter(Boolean)
      }

      const reservedKeyNames = ['index', 'default', 'script', 'description']
      const entries = Object.entries(val)
        .filter(([k]) => !reservedKeyNames.includes(k))
        .map(([k, v]) => {
          return process(v, {}, [...path, k])
        })
      return entries
    }
  }

  return commands
}

function printFlatCommands(commands) {
  commands.map(cmd => {
    const fullCommandName = cmd.path.join('.')

    console.log(fullCommandName)
    let prettyFn = null
    if (cmd.cmdFn) {
      //console.log(require('util').inspect(cmd.cmdFn))
      const desc = cmd.cmdFn.desc || cmd.cmdFn.description
      prettyFn = cmd.cmdFn.toString()

      // TODO(vjpr): Don't want such a heavy dependency.
      //   Maybe we can print the code from the source map.
      //const prettyFn = require('prettier').format(cmd.cmdFn, {
      //  semi: false,
      //  parser: 'babel',
      //})

      console.log(indent(c.grey(cmd.cmdStr), 4))
      console.log(indent(c.grey(desc), 4))
    }
    console.log(indent(c.grey(cmd.cmdStr), 4))
  })
}
