const { info, express: expressLogger } = require('@usermirror/log')
const metrics = require('@usermirror/metrics')
const express = require('express')
const cors = require('cors')

const app = express()
const v1 = require('./v1')

metrics.init({ name: 'go_helpusersvote' })
metrics.addToExpress(app)

app.use(expressLogger())
app.use(cors())
app.use('/v1', v1)

app.get('/internal/health', (_, res) => res.json({ hi: '☺' }))
app.get('/', (req, res, next) => {
  const referrer = req.get('Referrer')

  if (referrer) {
    info('redirect.index: routing', { referrer })
  }

  req.params = {
    namespace: 'demo',
    campaign: 'cfg_1A5xskaAf8VXzMmwsVRdl50KfVe'
  }

  return v1.redirect(req, res, next)
})

app.get('/:namespace', (req, res, next) => {
  if (req.params.namespace === 'favicon.ico') {
    return res.status(200).end()
  }

  req.params.campaign = 'default'

  return v1.redirect(req, res, next)
})

const port = process.env.PORT || 3000

app.listen(port, () => info('server.ready', { port }))
