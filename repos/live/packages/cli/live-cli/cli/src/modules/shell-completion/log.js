// Because we can't use console.log when being run by shell complete.

const enabled = process.env.LIVE_CLI_COMP_LOG

export default function log(...args) {
  if (!enabled) return
  require('fs').appendFileSync(
    require('path').join(__dirname, '../../../tmp/argv.txt'),
    require('util').format(...args) + '\n',
  )
}
