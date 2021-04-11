/// <reference types="cypress" />
// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = function (on, config) {
  // Send logs to console.
  // See `support/index.js` for additional configuration.
  require('cypress-terminal-report/src/installLogsPrinter')(on)

  ////////////////////

  //require('cypress-log-to-output').install(on)

  ////////////////////

  on('task', {
    log(message) {
      console.log(message)
      return null
    },
  })

  on('task', {
    'reset:db' (data) {
      // TODO(vjpr): We can call JS code from here.
      //return resetDb()
    }
  })

}
