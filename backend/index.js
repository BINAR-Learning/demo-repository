const express = require('express')
const app = express()
const db = require('./src/models')
const router = require('./src/routes/index')
const cors = require('cors')
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
db.sequelize
  .sync()
  .then(() => {
    console.log('Synced db.')
  })
  .catch((err) => {
    console.log('Failed to sync db: ' + err.message)
  })
app.use(router)
app.listen(3001)
