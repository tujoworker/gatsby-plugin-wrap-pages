Cypress.config({
  baseUrl: 'http://localhost:9092/',
})

describe('example-micro-frontends', () => {
  it('root page has header with repo link', () => {
    cy.visit('/')
    cy.get('header').contains('Repo')
  })

  it('root page has wrapper with "main" element', () => {
    cy.visit('/')
    assert.exists(cy.get('main'))
  })

  it('root page has wrapper with "lightgreen" color', () => {
    cy.visit('/')
    cy.get('main > div')
      .should('have.attr', 'style')
      .and('match', /lightgreen/i)
  })

  it('visit @micro-app/one and check the color', () => {
    cy.visit('/')
    cy.get('a[href="/one"]').click()
    assert.exists(cy.get('main'))
    assert.exists(cy.get('header'))
    cy.get('main > div').contains('@micro-app/one')
    cy.get('main > div')
      .should('have.attr', 'style')
      .and('match', /deeppink/i)
  })

  it('visit @micro-app/two and check the color', () => {
    cy.visit('/')
    cy.get('a[href="/two"]').click()
    assert.exists(cy.get('main'))
    assert.exists(cy.get('header'))
    cy.get('main > div').contains('@micro-app/two')
    cy.get('main > div').should('have.attr', 'style').and('match', /aqua/i)
  })
})
