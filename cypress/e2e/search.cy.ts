describe('Search bar', () => {
  beforeEach(() => {
    cy.setupData('test@example.com', true)
    cy.visitAndCheck('/dictionary')
  })

  afterEach(() => {
    cy.cleanupUser()
  })

  it('should allow you to search', () => {
    cy.findByTestId('combobox').type('f')
    cy.findByTestId('combobox-popover')
      .findByTestId('combobox-flabbergasted-option')
      .click()
    cy.findByTestId('search-button').click()

    cy.url().should('contain', '/English/flabbergasted')
  })

  it('should allow you to search not existing words', () => {
    cy.findByTestId('combobox').type('cypress')

    cy.findByTestId('combobox-popover').then((popover) => {
      cy.wrap(popover).findByRole('option').should('have.length', 0)
      cy.wrap(popover).findByText(/no suggestions found/i)
    })

    cy.findByTestId('search-button').click()

    cy.url().should('contain', '/English/cypress')

    cy.findByText(/cypress not found/i)
    cy.findByRole('link').should('have.text', 'Do You want to add it?').click()

    cy.url().should('contain', '/words/new?word=cypress&language=English')
  })

  it.only('should allow you to swap translation languages', () => {
    cy.findByTestId('language-select-button').click()

    cy.findByRole('listbox')
      .findByText(/english - spanish/i)
      .click()

    cy.get('#swap-language-btn').click()

    cy.findByTestId('language-select-button').findByText(/spanish - english/i)
  })

  it.only('should show a placeholder with the current languages', () => {
    // cy.intercept('GET', '/dictionary?_data=routes%2Fdictionary').as(
    //   'search-bar-data'
    // )

    // cy.wait('@search-bar-data')
    cy.findByTestId('combobox')
      .should('have.attr', 'placeholder')
      .and('include', 'Search English')

    cy.findByTestId('language-select-button').click()

    cy.findByRole('listbox', { timeout: 10000 })
      .findByText(/english - spanish/i)
      .click()
  })
})
