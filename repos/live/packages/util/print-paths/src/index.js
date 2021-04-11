import readJsonFile from 'read-json-file'
import yaml from 'js-yaml'
import flowConfigParser from 'flow-config-parser'
import fs from 'fs'
import chalk from 'chalk'
import path, {join} from 'path'
import _ from 'lodash'

//import jsdiff from 'diff'

const jsdiff = require('diff')

// Should we show the whole config file with the keys that involve paths highlighted.
// We do this because sometimes there may be keys that are relevant but we forgot.
const highlightRelevantConfigKeys = true

export default async function() {

  console.log('RUNNING IN:', process.cwd())

  const locations = [
    ['pjson', './package.json', ['workspaces'], {shouldHighlight: false, title: 'yarn-workspaces/flow-mono-cli'}],
    ['pjson', './package.json', ['ava'], {shouldHighlight: false, title: 'ava'}],
    ['json', 'lerna.json', ['packages']],
    ['yaml', 'pnpm-workspace.yaml'],
    ['flowconfig', '.flowconfig'],
    ['js', 'wallaby.js', ['files', 'tests', 'filesWithNoCoverageCalculated'], {}, (config) => {
      const wallabyMock = {defaults: {}, compilers: {babel: () => {}}}
      return config(wallabyMock)
    }],
    ['js', './.meta'],
  ]

  console.log('Sources:')
  for (const [type, p, keys, opts, configGetter] of locations) {
    const title = (opts && opts.title) || p
    console.log('- ', title)
  }
  console.log()

  for (const [type, p, keys, opts, configGetter] of locations) {
    const title = (opts && opts.title) || p
    console.log(chalk.bold.green(title))

    if (!fs.existsSync(p)) {
      console.log('n/a')
      continue
    }
    const contents = fs.readFileSync(p, 'utf8')
    const repoRoot = process.cwd()

    let config
    switch (type) {
      case 'json':
        config = JSON.parse(contents)
        break
      case 'yaml':
        config = yaml.safeLoad(contents)
        break
      case 'flowconfig':
        config = flowConfigParser(contents)
        break
      case 'js':
        config = require(join(repoRoot, p))
        config = (configGetter && configGetter(config)) || config
        break
      case 'pjson':
        config = JSON.parse(contents)
        break
    }

    if (keys) {
      // TODO(vjpr): Use nullish.
      const shouldHighlight = _.isUndefined(opts?.shouldHighlight) ? true : opts?.shouldHighlight
      highlightRelevantKeys(config, keys, shouldHighlight)
    } else {
      console.log(config)
    }

    console.log()
  }
}

function highlightRelevantKeys(config, keys, shouldHighlight) {
  const relevantConfig = _.pick(config, keys)
  if (!shouldHighlight) {
    return console.log(relevantConfig)
  }
  //console.log({config, relevantConfig})
  const diff = jsdiff.diffJson(config, relevantConfig)
  diff.forEach(function(part) {
    // green for additions, red for deletions
    // grey for common parts
    const color = part.added ? 'green' : part.removed ? 'grey' : 'white'
    console.log(chalk[color](part.value))
  })
}
