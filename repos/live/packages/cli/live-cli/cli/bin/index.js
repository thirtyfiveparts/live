#!/usr/bin/env node

// TODO(vjpr): Extract performance stuff / completion stuff from here into separate package.

// We transpile on-the-fly when using this entry point so we don't need to check.
process.env.NO_TRANSPILE_CHECKER = process.env.NO_TRANSPILE_CHECKER ?? 0

////////////////////////////////////////////////////////////////////////////////

require('@live/cli-helper/console-caller.es5.js')()

////////////////////////////////////////////////////////////////////////////////

// Perf

const {perf, timeRequires} = require('@live/log/es5')

// TODO(vjpr): Doesn't exist in log library because it doesn't support isometric browser env yet.
//timeRequires()

// Enable this to print require timings.
const useRequireClock = process.env.PERF
let requireClock = null
if (useRequireClock) {
  //requireClock = require('/Users/Vaughan/dev-live/+require-tools/packages/require-clock')
  requireClock = require('require-clock')
    .default()
  requireClock.start()
}

////////////////////////////////////////////////////////////////////////////////

shellCompletion()

// See `get-shell-env-vars.js`.
global.origProcessEnv = Object.assign({}, process.env)

let perfEnd = perf('init @live/cli-helper')
require('@live/cli-helper')({
  projectRoot: require('path').join(__dirname, '..'),
  babelConfigGetter: (config) => {
    // TODO(vjpr): This may break stuff! Uses .babelrc files instead.
    //   Yep, it caused `packages/public/tools/live/livefile.js unexpected identifier` error.
    //config.configFile = false
    // With this disabled we are pulling in a huge root preset though which will be slower than just using our `node-simple` preset.
    // --
    return config
  },
}).then(() => {
  perfEnd()
  require('../src/index')
    .default()
    .then(() => {
      requireClock && requireClock.end()
    })
    .catch(e => {
      throw e
    })
})

// Needed because sometimes we just call process.exit() which means the main promise never resolves above.
process.on('exit', () => {
  requireClock && requireClock.end()
})

////////////////////////////////////////////////////////////////////////////////

function shellCompletion() {
  // The default installation method uses this.
  // PERF: This will run on every terminal creation so it needs to be fast.
  if (~process.argv.indexOf('--completion')) {
    console.time('completion')
    const omelette = require('omelette')
    omelette('live|lives <one> <two>')
    // NOTE: Will automatically exit.
  }

  if (~process.argv.indexOf('--compgen')) {
    // We are running the bin only for completion generation.
    // NO STRAY `console.log`s please!
    // DEBUG
    require('fs').appendFileSync(
      require('path').join(__dirname, '../tmp/argv.txt'),
      'Running with args: ' + process.argv.slice(2).join(' ') + '\n',
    )
  }
  // ---
}
