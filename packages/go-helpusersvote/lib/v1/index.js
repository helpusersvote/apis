const { Router } = require('express')
const redirect = require('./redirect')

const v1 = Router()

v1.use(redirect)

// expose handlers
v1.redirect = redirect.handler

module.exports = v1
