const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const v1 = require('./v1')

app.use(morgan('dev'))
app.use(cors())
app.use('/v1', v1)

const homeURL = 'https://helpusersvote.com/dashboard'

app.get('/internal/health', (_, res) => res.send('☺'))
app.get('/', (_, res) => res.redirect(homeURL))

const port = process.env.PORT || 3000

app.listen(port, () => {
  console.log(`server.ready: { port: ${port} }`)
})
