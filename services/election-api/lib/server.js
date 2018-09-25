const { info, express: expressLogger } = require('@usermirror/log')
const metrics = require('@usermirror/metrics')
const express = require('express')
const cors = require('cors')

const app = express()
const v1 = require('./v1')

metrics.init({ name: 'election_api' })
metrics.addToExpress(app)

app.use(expressLogger())
app.use(cors())
app.use('/v1', v1)

const homeURL = 'https://helpusersvote.com'

app.get('/internal/health', (_, res) =>
  res.send(
    `<p style="color: #2E7D32;font-weight: bold;font-size: 24px;padding-left: 8px;">☺</p>`
  )
)
app.get('/', (_, res) => res.redirect(homeURL))

const port = process.env.PORT || 3000

app.listen(port, () => info('server.ready', { port }))
