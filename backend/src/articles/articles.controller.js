// articles.controller.js
const articlesService = require('./articles.service')

class ArticlesController {
  test(req, res) {
    const result = articlesService.test()
    res.status(200).json(result)
  }
  findAll(req, res) {
    articlesService
      .findAll()
      .then((articles) => {
        res.status(200).json(articles)
      })
      .catch((error) => {
        res.status(500).json({ message: 'Error retrieving articles', error })
      })
  }
}

module.exports = new ArticlesController()
