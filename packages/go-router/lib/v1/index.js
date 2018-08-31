const { Router } = require('express')
const redirect = require('./redirect')

const v1 = Router()

v1.use(redirect)

module.exports = v1
