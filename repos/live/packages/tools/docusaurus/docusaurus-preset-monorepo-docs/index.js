//require('@babel/register')({cwd: __dirname, extensions: ['.ts', '.js']})
//require('regenerator-runtime')

require('@live/simple-cli-helper')()

// TODO(vjpr): A little hacky. Let's move everything here.
module.exports = require('./src').default
