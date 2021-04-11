import 'cypress-localstorage-commands'
import '@testing-library/cypress/add-commands'
import users from './fixtures'
import path, {join} from 'path'

// Don't use this as it break `getLocalStorage` and others.
//import 'cypress-get-it'

import * as fixtures from '../support/fixtures'

////////////////////////////////////////////////////////////////////////////////

// Login

Cypress.Commands.add('login', ({username, password}) => {
  loginWithGraphql({username, password})
})

Cypress.Commands.add('loginByType', userType => {
  const {username, password} = users[userType]
  loginWithGraphql({username, password})
})

Cypress.Commands.add('loginViaForm', (username, password, options = {}) => {
  cy.visit('/login/')
  cy.get('#login input[name="username"]').clear().type(username)
  cy.get('#login input[name="password"]').clear().type(password)
  cy.get('#login button[type="submit"]').click()
})

// Sync with JavaScript BACKEND code.
const LOGIN_URL = '/api/auth/login'

function login({username, password}) {
  const {baseUrl} = Cypress.config()
  return cy
    .request({
      method: 'POST',
      url: baseUrl + LOGIN_URL,
      form: true,
      body: {
        username: fixtures.user.username,
        password: fixtures.user.password,
        grant_type: 'password',
      },
    })
    .then(resp => {
      // TODO(vjpr): Why doesn't this work!?
      //cy.log(JSON.stringify(resp, null, 2))
      //Cypress.log(JSON.stringify(resp, null, 2))
      window.localStorage.setItem('accessToken', resp.body.accessToken)
      return resp
    })
}

function loginWithGraphql({username, password}) {
  const query = `
    mutation LoginUser($input: UserLoginInput) {
      userLogin(input: $input) {
        id
        email
      }
    }
  `
  const variables = {
    input: {
      email: username,
      password,
    },
  }
  const {baseUrl} = Cypress.config()
  const opts = {
    // Sync with server.
    url: '/api/graphql',
    method: 'POST',
    body: {operationName: 'LoginUser', query, variables},
  }
  return cy.request(opts)
}

////////////////////////////////////////////////////////////////////////////////

require('cypress-terminal-report/src/installLogsCollector')({
  printLogs: 'always',
  //printLogs: 'onFail',
})

////////////////////////////////////////////////////////////////////////////////

Cypress.Commands.overwrite('log', (subject, message) => cy.task('log', message))
