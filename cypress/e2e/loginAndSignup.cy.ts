import { faker } from '@faker-js/faker'

describe('smoke tests', () => {
  afterEach(() => {
    cy.cleanupUser()
  })

  it('should allow you to register and login', () => {
    const signupForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: faker.internet.password(),
      name: faker.name.firstName(),
      surname: faker.name.lastName(),
    }

    cy.then(() => ({ email: signupForm.email })).as('user')

    cy.visitAndCheck('/')
    cy.findByRole('link', { name: /sign up/i }).click()
    cy.findByTestId('name').type(signupForm.name)
    cy.findByTestId('surname').type(signupForm.surname)
    cy.findByTestId('email').type(signupForm.email)
    cy.findByTestId('password').type(signupForm.password)
    cy.findByRole('button', { name: /create account/i }).click()

    cy.url().should('eq', Cypress.config().baseUrl + '/dictionary')
  })

  it('should allow you login', () => {
    const loginForm = {
      email: `${faker.internet.userName()}@example.com`,
      password: 'myreallystrongpassword',
    }
    cy.createUser({ email: loginForm.email })
    cy.visitAndCheck('/')

    cy.findByRole('link', { name: /log in/i }).click()
    cy.findByTestId('email').type(loginForm.email)
    cy.findByTestId('password').type(loginForm.password)

    cy.findByRole('button', { name: /log in/i }).click()

    cy.url().should('eq', Cypress.config().baseUrl + '/dictionary')
  })

  it('should allow you to make a note', () => {
    const testNote = {
      title: faker.lorem.words(1),
      body: faker.lorem.sentences(1),
    }
    cy.login()

    cy.visitAndCheck('/notes')

    cy.findByRole('link', { name: /notes/i }).click()
    cy.findByText('No notes yet')

    cy.findByRole('link', { name: /\+ new note/i }).click()

    cy.findByRole('textbox', { name: /title/i }).type(testNote.title)
    cy.findByRole('textbox', { name: /body/i }).type(testNote.body)
    cy.findByRole('button', { name: /save/i }).click()

    cy.findByRole('button', { name: /delete/i }).click()

    cy.findByText('No notes yet')
  })
})
