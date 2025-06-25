const db = require('../models')
class ArticlesService {
  test() {
    return {
      message: 'Articles service is working!',
    }
  }
  async findAll() {
    return await db.database.Articles.findAll({
      order: [['createdAt', 'DESC']],
    })
  }
}
module.exports = new ArticlesService()
