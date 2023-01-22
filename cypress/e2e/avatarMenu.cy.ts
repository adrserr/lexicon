describe('avatar menu', () => {
  afterEach(() => {
    cy.cleanupUser()
  })

  it('should allow you to logout', () => {
    cy.login()
    cy.visitAndCheck('/')

    cy.findByTestId('avatar-button').click()
    cy.findByTestId('avatar-dropdown').within(() => {
      cy.findByText(/logout/i).click()
    })

    cy.url().should('eq', Cypress.config().baseUrl + '/')
  })

  it('should allow you to visit your profile', () => {
    cy.login()
    cy.visitAndCheck('/')

    cy.findByTestId('avatar-button').click()
    cy.findByTestId('avatar-dropdown').within(() => {
      cy.findByText(/profile/i).click()
    })

    cy.url().should('eq', Cypress.config().baseUrl + '/dictionary/me')
    cy.findByTestId('avatar-dropdown').should('not.exist')
  })

  it('should allow you to visit your words', () => {
    cy.login()
    cy.visitAndCheck('/')

    cy.findByTestId('avatar-button').click()
    cy.findByTestId('avatar-dropdown').within(() => {
      cy.findByText(/words/i).click()
    })

    cy.url().should('eq', Cypress.config().baseUrl + '/dictionary/words')
    cy.findByTestId('avatar-dropdown').should('not.exist')
  })

  it('should allow you to visit your languages', () => {
    cy.login()
    cy.visitAndCheck('/')

    cy.findByTestId('avatar-button').click()
    cy.findByTestId('avatar-dropdown').within(() => {
      cy.findByText(/languages/i).click()
    })

    cy.url().should('eq', Cypress.config().baseUrl + '/dictionary/languages')
    cy.findByTestId('avatar-dropdown').should('not.exist')
  })
})
