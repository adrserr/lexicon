describe('Languages page', () => {
  beforeEach(() => {
    cy.setupData('test@example.com', true)
    cy.visitAndCheck('/dictionary/languages')
  })

  afterEach(() => {
    cy.cleanupUser()
  })

  it('should render a list of languages', () => {
    cy.findByTestId('languages-header').then((header) => {
      cy.wrap(header).findByText(/Languages/i)
      cy.wrap(header).findByRole('link').should('have.text', 'add')
    })

    cy.findByRole('list').then((list) => {
      cy.wrap(list).findAllByRole('listitem').should('have.length', 5)
    })
  })

  it('should be possible to edit language details', () => {
    cy.findByTestId('English-link').click()

    cy.findByTestId('language-form-English').then((form) => {
      cy.wrap(form)
        .findByLabelText('Name')
        .should('have.value', 'English')
        .clear()
        .type('testName')
      cy.wrap(form)
        .findByLabelText('Code')
        .should('have.value', 'en')
        .clear()
        .type('testCode')
      cy.wrap(form)
        .findByRole('button')
        .contains(/edit language/i)
      cy.wrap(form).submit()
      cy.findByRole('list').findByText('testName')
    })
  })

  it('should not be possible to edit a language with an existing language name', () => {
    cy.findByTestId('English-link').click()

    cy.intercept('PUT', 'dictionary/languages/*').as('edit-language')

    cy.findByTestId('language-form-English').then((form) => {
      cy.wrap(form)
        .findByLabelText('Name')
        .should('have.value', 'English')
        .clear()
        .type('Spanish')
      cy.wrap(form)
        .findByLabelText('Code')
        .should('have.value', 'en')
        .clear()
        .type('es')
      cy.wrap(form)
        .findByRole('button')
        .contains(/edit language/i)
      cy.wrap(form).submit()
    })

    cy.wait('@edit-language').should(({ response }) => {
      expect(response?.statusCode).to.equal(400)
      expect(response?.body.error).to.equal(
        'You have already created a language with that name'
      )
    })

    cy.findByTestId('language-form-error').should(
      'contain',
      'You have already created a language with that name'
    )
    cy.findByTestId('language-form-error').findByTestId(
      'language-form-error-icon'
    )
  })

  it('should be possible to add a language', () => {
    cy.findByTestId('add-language').click()
    cy.url().should('include', '/new')
    cy.intercept(
      'GET',
      '/dictionary/languages/*?_data=routes%2Fdictionary%2Flanguages'
    ).as('get-languages')
    cy.intercept(
      'GET',
      'dictionary/languages/*?_data=routes%2Fdictionary%2Flanguages%2F%24languageId'
    ).as('get-language-details')

    cy.findByTestId('language-form').then((form) => {
      cy.wrap(form).findByLabelText('Name').type('testName')
      cy.wrap(form).findByLabelText('Code').type('testCode')
      cy.wrap(form).submit()
    })

    cy.wait('@get-languages').its('response.statusCode').should('eq', 200)
    cy.findByRole('list').findByText('testName')

    // check redirection
    cy.wait('@get-language-details').then((request) => {
      cy.url()
        .should('not.include', '/new')
        .and('include', request.response?.body.language.id)
    })
  })

  it('should not be possible to add a repeated language', () => {
    cy.findByTestId('add-language').click()
    cy.url().should('include', '/new')

    cy.intercept('POST', '/dictionary/languages/new*').as('new-language')

    cy.findByTestId('language-form').then((form) => {
      cy.wrap(form).findByLabelText('Name').type('English')
      cy.wrap(form).findByLabelText('Code').type('en')
      cy.wrap(form).submit()
    })

    cy.wait('@new-language').should(({ response }) => {
      expect(response?.statusCode).to.equal(400)
      expect(response?.body?.error).to.equal(
        'You have already created a language with that name'
      )
    })

    cy.findByTestId('language-form-error').should(
      'contain',
      'You have already created a language with that name'
    )
    cy.findByTestId('language-form-error').findByTestId(
      'language-form-error-icon'
    )
  })

  it('should be possible to delete a language', () => {
    cy.findByTestId('English-link').click()

    cy.intercept('DELETE', '/dictionary/languages/*').as('delete-language')
    cy.findByTestId('delete-language-form').submit()
    cy.wait('@delete-language').its('response.statusCode').should('eq', 204)

    cy.findByRole('list').then((list) => {
      cy.wrap(list).findAllByRole('listitem').should('have.length', 4)
      cy.findByTestId('English-link').should('not.exist')
    })

    cy.url().should('eq', Cypress.config().baseUrl + '/dictionary/languages')
  })

  it('should change selected language details', () => {
    cy.intercept('GET', '/dictionary/languages/*').as('english-details')
    cy.findByTestId('English-link').click()
    cy.wait('@english-details').its('response.statusCode').should('eq', 200)

    cy.findByTestId('language-form-English')
      .as('language-form')
      .then((form) => {
        cy.wrap(form).findByLabelText('Name').should('have.value', 'English')

        cy.wrap(form).findByLabelText('Code').should('have.value', 'en')
      })

    cy.intercept('GET', '/dictionary/languages/*').as('spanish-details')
    cy.findByTestId('Spanish-link').click()
    cy.wait('@spanish-details')
      .its('response')
      .then((response) => {
        cy.wrap(response).its('statusCode').should('eq', 200)
        cy.wrap(response).its('body.language.name').should('eq', 'Spanish')
      })

    cy.findByTestId('language-form-Spanish').then((form) => {
      cy.wrap(form).findByLabelText('Name').should('have.value', 'Spanish')

      cy.wrap(form).findByLabelText('Code').should('have.value', 'es')
    })
  })

  it("should show a message if the language doesn't exist", () => {
    cy.visitAndCheck('/dictionary/languages/inventedLanguageId')

    cy.findByTestId('language-not-found').should(
      'have.text',
      "Opps, the language with that id doesn't exists"
    )
  })

  it('should display the correct head title', () => {
    cy.get('head title').should('have.text', 'Languages')
    cy.findByTestId('English-link').click()
    cy.get('head title').should('have.text', 'Languages - English')
    cy.findByTestId('languages-header').findByRole('link').click()
    cy.get('head title').should('have.text', 'Languages - Add new')
  })
})
