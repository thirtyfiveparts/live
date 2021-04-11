import './commands'


// Run before all tests.
before(() => {
  setupFromGetRequest()
  //setupFromScripts()
})

// Runs a script to reset the database.
function setupFromScripts() {
  //const backendPath = Cypress.env('BACKEND_PATH')
  console.log(__dirname)
  // TODO(vjpr): Fix!
  const backendPath =
    '/Users/Vaughan/dev-mono/thirtyfive/repos/live/packages/app-templates/full-stack-graphql-react/node-backend'
  const cmd = `cd ${backendPath} && bin/cli.js db:reset`
  cy.exec(cmd, {failOnNonZeroExit: false}).then(res => {
    //cy.log(res.stdout)
  })
}

// Make a request to a private API in the backend to reset the database.
// This means we don't have to spin up the entire app just to reset the database.
function setupFromGetRequest() {
  cy.request('POST', 'api/debug-reset')
}
