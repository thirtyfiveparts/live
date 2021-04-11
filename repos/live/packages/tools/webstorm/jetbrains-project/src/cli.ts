import 'source-map-support/register'
import 'hard-rejection/register'
import Yargs from 'yargs'
import Debug from 'debug'
import findClosestIml from '@src/modules/find-closest-iml'
import path, {join} from 'path'
import {padStart} from 'lodash'
import c from 'chalk'
import watch from '@src/modules/watch'
import exit from 'exit'

const debug = Debug('node-idea')

// Quick test:
// DEBUG=*,-nodemon* nodemon -w lib bin/index.js -- --cwd=/Users/Vaughan/dev-live

export async function cli(args) {

  if (!args) args = process.argv
  const yargs = Yargs.usage('idea-exclude')
    .command('ls', 'Yo')
    .options({
      'dry-run': {
        alias: 'n',
        describe: 'Show what would happen.',
      },
      cwd: {
        describe: 'Working dir',
        default: process.cwd(),
      },
    })
    .help()
  const argv = yargs.parse(args)

  debug(argv)
  const {cwd, dryRun} = argv

  if (dryRun) {
    console.warn(c.yellow('Dry run mode activated. No files will be modified.'))
  }

  const {imlFile, ideaPath} = await findClosestIml({cwd})
  if (!imlFile) {
    console.log('.iml file not found. Exiting.')
    exit()
  }
  const projectPath = path.resolve(ideaPath, '..')
  printPaths({imlFile, ideaPath, projectPath})
  await watch({cwd: projectPath, dryRun, imlFile, ideaPath})
}

function printPaths({imlFile, ideaPath, projectPath}) {
  let str = ''
  str += 'Paths\n'
  str += '.idea path:\t' + ideaPath + '\n'
  str += '.iml file path:\t' + imlFile + '\n'
  str += 'project path:\t' + projectPath + '\n'
  console.log(str)
}
