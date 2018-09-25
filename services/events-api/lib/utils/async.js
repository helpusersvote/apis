const PrettyError = require('pretty-error')

const pe = new PrettyError()

exports.wrap = fn => {
  return (req, res, next) => {
    return fn(req, res, next).catch(err => {
      if (err) {
        console.error('\n' + pe.render(err))
        return res.json({
          error: {
            code: 'unknown',
            message:
              'Please try again later, our engineers are investigating what happened.'
          }
        })
      } else {
        return next()
      }
    })
  }
}
