/* global cy, beforeEach, context, it, expect */

import * as fixtures from '../support/fixtures'

const {username, password} = fixtures.user

context('Login via html form', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('successfully logs in after filling login form fields', function() {
    cy.loginViaForm(fixtures.user.username, fixtures.user.password)
    cy.location().should(location => {
      expect(location.pathname).to.eq('/')
    })
    //const ls = cy.getLocalStorage('accessToken')
    //cy.getLocalStorage('accessToken').should('exist')
  })
})

context.only('Login via POST', () => {
  beforeEach(() => {
    cy.visit('/')
  })
  it('successfully logs in via POST', function() {
    cy.login({username, password}).then((resp) => {
      // TODO(vjpr): I'm not sure this check is working...
      //cy.getLocalStorage("accessToken").should("exist")
      //expect(localStorage.getItem('accessToken')).to.exist
    })
  })
})
