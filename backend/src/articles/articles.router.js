//article router.js
const express = require('express')
const router = express.Router()
const { test, findAll } = require('./articles.controller')

// Define the routes for articles
router.get('/test', test)
router.get('/', findAll)
module.exports = router
