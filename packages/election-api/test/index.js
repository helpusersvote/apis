const test = require('ava')

test(t => {
  // Check for JavaScript runtime errors
  require('../lib/server')

  t.pass()
})
