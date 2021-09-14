Cypress.config({
  baseUrl: 'http://localhost:9091/',
})

describe('example-basic', () => {
  it('root page has header with repo link', () => {
    cy.visit('/')
    cy.get('header').contains('Repo')
  })

  it('root page has wrapper with "main" element', () => {
    cy.visit('/')
    assert.exists(cy.get('main'))
  })

  it('sub-page page has wrapper with "aqua" color', () => {
    cy.visit('/sub-page')
    cy.get('main > div').should('have.attr', 'style').and('match', /aqua/i)
  })

  it('sub-page/second-page page has wrapper with "aqua" color', () => {
    cy.visit('/sub-page/second-page')
    cy.get('main > div').should('have.attr', 'style').and('match', /aqua/i)
  })

  it('sub-page/nested-routes page has wrapper with "deeppink" color', () => {
    cy.visit('/sub-page/nested-routes')
    cy.get('main > div')
      .should('have.attr', 'style')
      .and('match', /deeppink/i)
    cy.get('a:contains(/one/two)').click()
    // cy.window().should('not.have.prop', 'beforeReload')
    cy.get('main > div[style] output').contains('one/two')
  })

  it('more-examples page has wrapper with "lightskyblue" color', () => {
    cy.visit('/more-examples')
    cy.get('main > div')
      .should('have.attr', 'style')
      .and('match', /lightskyblue/i)
  })

  it('more-examples/second-page page has wrapper with "lightskyblue" and "orchid" color', () => {
    cy.visit('/more-examples/second-page')
    cy.get('main > div')
      .should('have.attr', 'style')
      .and('match', /lightskyblue/i)
    cy.get('main > div > div')
      .should('have.attr', 'style')
      .and('match', /orchid/i)
  })

  it('more-examples/second-page/third-page page has wrapper with "lightskyblue" and "orchid" and "yellow" color', () => {
    cy.visit('/more-examples/second-page/third-page')
    cy.get('main > div')
      .should('have.attr', 'style')
      .and('match', /lightskyblue/i)
    cy.get('main > div > div')
      .should('have.attr', 'style')
      .and('match', /orchid/i)
    cy.get('main > div > div > div')
      .should('have.attr', 'style')
      .and('match', /yellow/i)
  })
})
