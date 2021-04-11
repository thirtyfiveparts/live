require('@babel/register')({cwd: __dirname, extensions: ['.ts', '.js']})
//require('regenerator-runtime')

// TODO(vjpr): A little hacky. Let's move everything here.
module.exports = require('./src')
