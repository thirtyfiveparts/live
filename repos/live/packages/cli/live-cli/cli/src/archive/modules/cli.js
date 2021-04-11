// Copied from ioo-voo.

import Yargs from 'yargs'
import inquirer from 'inquirer'
import fuzzy from 'fuzzy'
import style from 'ansi-styles'
import ServiceHub, {registerServicesFromDict} from 'live-service-hub'
import glob from 'globby'
import path, {join} from 'path'
import _ from 'lodash'
import CommandHistory from '@src/modules/command-history'
import Debug from '@live/log/es5'
//import c from 'chalk'
//import cosmiconfig from 'cosmiconfig'
//import fs from 'fs-extra'
//import untildify from 'untildify'
//import userHome from 'user-home'

//import defaultTasks from './default-tasks'

const debug = Debug('app')

const {argv} = Yargs

const tasks = {}

const defaultConfig = {}

export default async function() {
  const cwd = join(__dirname, '../')
  //const cwd = process.cwd()
  const namespace = 'live'
  await main({cwd, namespace})
}

const projects = [
  {
    name: 'xxx',
    root: 'xxx',
  },
]

function findProjectByName(name) {
  return _.find(projects, {name})
}

function showHelp(project) {
  console.log('showing help for', project.name)
}

export async function main({cwd, namespace}) {
  const firstArg = argv._[0]
  const secondArg = argv._[1]

  if (!firstArg) {
    return console.log('Enter an arg please')
  }

  // First argument is `projectRoot`.
  const project = findProjectByName(firstArg)
  //console.log({project})

  let cmd
  if (project) {
    cmd = secondArg
  } else {
    cmd = firstArg
  }

  if (!cmd) {
    showHelp(project)
    return
  }

  if (cmd) debug.info(`Trying to run command: "${cmd}"`)

  ////////////////////////////////////////////////////////////////////////////////

  const serviceHub = new ServiceHub()
  const pluginsDir = join(cwd, 'plugins')
  const searchPaths = [join(pluginsDir, '*.js'), join(pluginsDir, '*/')]
  const files = glob.sync(searchPaths)
  debug('Found plugins:')
  debug(files.map(f => '- ' + f).join('\n'))
  for (const file of files) {
    const modulePath = file
    const module = require(file)
    const {services} = module
    registerServicesFromDict({serviceHub, services, module, modulePath})
    debug('Registering:', {services, modulePath})
  }

  ////////////////////////////////////////////////////////////////////////////////

  registerDefaultService({serviceHub, tasks, namespace})

  ////////////////////////////////////////////////////////////////////////////////

  serviceHub.run()

  ////////////////////////////////////////////////////////////////////////////////

  const lastCommand = new CommandHistory()
  if (cmd === 'again') {
    const lastCmd = lastCommand.read()
    if (lastCmd) {
      console.log('Running previous command: ', lastCmd)
      await runCommand({command: lastCmd, lastCommand, argv})
      return
    }
  }

  if (cmd) {
    await runCommand({command: cmd, lastCommand, argv})
    return
  }

  ////////////////////////////////////////////////////////////////////////////////

  inquirer.registerPrompt(
    'autocomplete',
    require('inquirer-autocomplete-prompt'),
  )

  const q = {
    name: 'command',
    type: 'autocomplete',
    message: 'wot u want?',
    source: searchTasks,
  }
  const res = await inquirer.prompt([q])

  const {command} = res

  await runCommand({command, lastCommand, argv})
}

function registerDefaultService({serviceHub, tasks, namespace}) {
  function handleArgs(args) {
    const [arg1, arg2] = args
    if (_.isObject(arg1)) {
      return arg1
    } else {
      return {cmd: arg1, fn: arg2}
    }
  }

  // Provide live core services.
  const liveService = {
    addCommand(...args) {
      const {cmd, fn} = handleArgs(args)
      tasks[cmd] = fn
    },
  }
  serviceHub.provide(`${namespace}.register`, '0.1.0', liveService)
}

async function runCommand({command, lastCommand, argv}) {
  lastCommand.write(command + '\n')

  console.log('Running:', {command})

  const fn = tasks[command]

  const opts = {argv}

  const isPromise = fn => fn.then

  if (!fn) {
    console.error('Command not found')
  } else if (isPromise(fn)) {
    await fn(opts)
  } else if (_.isFunction(fn)) {
    fn(opts)
  } else {
    console.error('Command not found')
  }
}

async function searchTasks(answers, input) {
  input = input || ''
  const taskKeys = Object.keys(tasks)
  const opts = {
    pre: style.red.open,
    post: style.red.close,
    extract: el => el,
  }
  const res = fuzzy.filter(input, taskKeys, opts)
  return res.map(el => ({name: el.string, value: el.original}))
}
