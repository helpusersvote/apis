const { Router } = require('express')
const bodyParser = require('body-parser')
const events = require('./events')
const reports = require('./reports')

const v1 = Router()

v1.use(bodyParser.json())
v1.use(events)
v1.use(reports)

module.exports = v1
