const leftPad = require('left-pad')

module.exports = ({MetroCore}) => {

  // Time tranformation of each file.
  // From https://github.com/facebook/metro/issues/253#issuecomment-422084406

  MetroCore.Logger.on('log', (logEntry) => {
    if (
      logEntry.action_name === 'Transforming file' &&
      logEntry.action_phase === 'end'
    ) {
      console.log(leftPad(parseInt(logEntry.duration_ms), 4), logEntry.file_name)
    }
  })

}
