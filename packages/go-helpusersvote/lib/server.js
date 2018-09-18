const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const v1 = require('./v1')

app.use(morgan('dev'))
app.use(cors())
app.use('/v1', v1)

app.get('/internal/health', (_, res) => res.json({ hi: '☺' }))
app.get('/', (req, res, next) => {
  const referrer = req.get('Referrer')

  if (referrer) {
    console.log('redirect.index: routing', referrer)
  }

  req.params = {
    namespace: 'demo',
    campaign: 'cfg_1A5xskaAf8VXzMmwsVRdl50KfVe'
  }

  return v1.redirect(req, res, next)
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`server.ready: { port: ${port} }`)
})
