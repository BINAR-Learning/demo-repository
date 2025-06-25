const { user_key, auth } = require('./config')
describe('faq data testing', () => {
  // GET/faq
  it('GET list data', () => {
    const page = 1
    cy.request({
      method: 'GET',
      url: `test?page=${page}`,
      headers: {
        'Content-Type': 'application/json',
      },
    }).as('getData')
    cy.get('@getData').then((res) => {
      expect(res.status).to.eq(200)
      assert.isArray(res.body.data.result, 'getData is an array')
    })
  })
})
