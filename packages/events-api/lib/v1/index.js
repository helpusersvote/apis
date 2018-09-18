const { Router } = require('express')
const bodyParser = require('body-parser')
const track = require('./track')
const reports = require('./reports')

const v1 = Router()

v1.use(bodyParser.json())
v1.use(track)
v1.use(reports)

module.exports = v1
