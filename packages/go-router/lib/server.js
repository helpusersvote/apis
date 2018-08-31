const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const v1 = require('./v1')

app.use(morgan('dev'))
app.use(cors())
app.use('/v1', v1)

app.get('/internal/health', (_, res) => res.json({ hi: '☺' }))
app.get('/', (_, res) => res.json({ hi: '☺' }))

const port = process.env.PORT || 4800

app.listen(port, () => {
  console.log(`server.ready: { port: ${port} }`)
})
