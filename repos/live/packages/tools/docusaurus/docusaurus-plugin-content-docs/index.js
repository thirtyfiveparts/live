require('@babel/register')({cwd: __dirname, extensions: ['.ts', '.js']})
//require('regenerator-runtime')

module.exports = require('./src/index.ts')
