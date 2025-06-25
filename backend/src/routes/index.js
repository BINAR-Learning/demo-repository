const express = require('express')
const router = express.Router()
const article = require('../articles/articles.router')
router.use('/articles', article)

module.exports = router
