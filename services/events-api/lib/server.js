const { express: expressLogger, info } = require('@usermirror/log')
const metrics = require('@usermirror/metrics')
const express = require('express')
const cors = require('cors')

const app = express()
const v1 = require('./v1')

metrics.init({ name: 'events_api' })
metrics.addToExpress(app)

app.use(expressLogger())
app.use(cors())
app.use('/v1', v1)

const homeURL = 'https://helpusersvote.com/dashboard'

app.get('/internal/health', (_, res) => res.send('☺'))
app.get('/', (_, res) => res.redirect(homeURL))

const port = process.env.PORT || 3000

app.listen(port, () => info('server.ready', { port }))
