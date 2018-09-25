const backends = {}

backends.example = require('./example')
backends.google = require('./google')
backends.onprem = require('./onprem')

backends.useBackend = type => backends[type]

module.exports = backends
