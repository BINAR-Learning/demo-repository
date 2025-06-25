const DataTypes = require('sequelize').DataTypes
const articles = require('./articles')

function initModels(sequelize) {
  const Articles = articles(sequelize, DataTypes)
  return {
    Articles,
  }
}
module.exports = initModels
module.exports.initModels = initModels
module.exports.default = initModels
