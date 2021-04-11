require('@babel/register')({
  cwd: __dirname,
  presets: ['@babel/preset-env'],
})
require('regenerator-runtime')
module.exports = require('./config/docusaurus.config.js').default
