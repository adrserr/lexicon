describe('Profile page', () => {
  beforeEach(() => {
    cy.setupData('test@example.com', true)
    cy.visitAndCheck('/dictionary/me')
  })

  afterEach(() => {
    cy.cleanupUser()
  })

  it('should show user info', () => {
    cy.get('head title').should('have.text', 'Profile - John Doe')
    cy.findByText(/^profile$/i)
      .should('have.prop', 'tagName')
      .should('eq', 'H1')

    cy.findByTestId('user-info-form').then((form) => {
      cy.wrap(form).findByLabelText('Name').should('have.value', 'John')
      cy.wrap(form).findByLabelText('Surname').should('have.value', 'Doe')
      cy.wrap(form)
        .findByLabelText('Email')
        .should('have.value', 'test@example.com')
      cy.wrap(form).findByRole('button').should('have.text', 'Save Changes')
    })
  })

  it('should be possible to update user info', () => {
    cy.intercept('PUT', '/dictionary/me*').as('edit-user')

    cy.findByTestId('user-info-form').then((form) => {
      cy.wrap(form).findByLabelText('Name').clear().type('Jane')
      cy.wrap(form).findByLabelText('Surname').clear().type('Douglas')
      cy.wrap(form).findByLabelText('Email').clear().type('test2@example.com')
      cy.then(() => ({ email: 'test2@example.com' })).as('user')
      // Using cypress submit method you omit the button value and the action doesn't work
      // cy.wrap(form).submit()
      cy.wrap(form).findByRole('button', { name: 'Save Changes' }).click()
    })

    cy.wait('@edit-user').should(({ response, request }) => {
      expect(response?.statusCode).to.equal(200)
      expect(decodeURIComponent(request.body)).to.include('name=Jane')
      expect(decodeURIComponent(request.body)).to.include('surname=Douglas')
      expect(decodeURIComponent(request.body)).to.include(
        'email=test2@example.com'
      )
    })
    // check if the user info has been updated
    cy.reload()

    cy.findByTestId('user-info-form').then((form) => {
      cy.wrap(form).findByLabelText('Name').should('have.value', 'Jane')
      cy.wrap(form).findByLabelText('Surname').should('have.value', 'Douglas')
      cy.wrap(form)
        .findByLabelText('Email')
        .should('have.value', 'test2@example.com')
    })
  })

  it('should be possible to change the password', function () {
    cy.intercept('PUT', '/dictionary/me*').as('change-pass')
    cy.findByTestId('password-change-form').then((form) => {
      cy.wrap(form).findByLabelText('Password').type('12345678')
      cy.wrap(form).findByLabelText('New Password').type('87654321')
      cy.wrap(form).findByLabelText('Repeat New Password').type('87654321')
      // Using cypress submit method you omit the button value and the action doesn't work
      // cy.wrap(form).submit()
      cy.wrap(form).findByRole('button', { name: 'Save New Password' }).click()
    })

    cy.wait('@change-pass').should(({ request, response }) => {
      expect(decodeURIComponent(request.body)).to.include('password=12345678')
      expect(decodeURIComponent(request.body)).to.include(
        'newPassword=87654321'
      )
      expect(decodeURIComponent(request.body)).to.include(
        'repeatNewPassword=87654321'
      )
      expect(response?.statusCode).to.equal(200)
    })

    cy.findByTestId('avatar-button').click()
    cy.findByTestId('avatar-dropdown').within(() => {
      cy.findByText(/logout/i).click()
    })

    cy.findByRole('link', { name: /log in/i }).click()

    cy.findByTestId('email').type(this.user.email)
    cy.findByTestId('password').type('87654321')

    cy.intercept('POST', '/login*').as('login')
    cy.findByRole('button', { name: /log in/i }).click()

    cy.wait('@login').should(({ request, response }) => {
      expect(response?.statusCode).to.equal(204)
    })
    cy.url().should('eq', Cypress.config().baseUrl + '/dictionary')
  })
})
