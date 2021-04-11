//import faker from 'faker'

context('Signup via html form', () => {
  beforeEach(() => {
    cy.visit('/signup/')
  })

  it('should work', function() {

    const signup = {
      companyName: 'foo',
      firstName: 'John',
      surname: 'Smith',
      email: 'john.smith@fake.com',
      password: 'foo',
    }

    fill('companyName', signup.companyName)
    fill('userFirstName', signup.firstName)
    fill('userLastName', signup.surname)
    fill('userEmail', signup.email)
    fill('userPassword', signup.password)
    cy.get('#signup button[type="submit"]').click()
    cy.url().should('include', '/login')

  })

})

context('Signup via POST request', () => {

})

function fill(name, val) {
  return cy.get(`#signup #signup_${name}`).clear().type(val)
}
