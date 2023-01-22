describe('Words page', () => {
  beforeEach(() => {
    cy.setupData('test@example.com', true)
    cy.visitAndCheck('/dictionary/words')
  })

  afterEach(() => {
    cy.cleanupUser()
  })

  it('should render a list of words', () => {
    cy.findByTestId('words-header').should('have.text', 'My Words')
    cy.findByTestId('words-list').then((list) => {
      cy.wrap(list).findAllByRole('listitem').should('have.length', 14)
    })
  })

  it('should be possible to visit each word', () => {
    cy.findByTestId('stunned').click()
    cy.url().should('contains', '/English/stunned')

    cy.findByTestId('word-header').then((header) => {
      cy.wrap(header).findByText(/stunned/i)
      cy.wrap(header).findByRole('link').should('have.text', 'edit')
    })
  })
})
