require('source-map-support/register')

//require('@babel/polyfill')
//require('./lib/babel-polyfill-slim')
// TODO(vjpr): If we only include this, we have faster startups, but now
//   our apps must take care of loading the polyfills they need. Which makes sense.
global.regeneratorRuntime = require('regenerator-runtime/runtime')

module.exports = require('./lib/index')
