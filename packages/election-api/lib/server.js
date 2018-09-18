const express = require('express')
const morgan = require('morgan')
const cors = require('cors')

const app = express()
const v1 = require('./v1')

app.use(morgan('dev'))
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

app.listen(port, () => {
  console.log(`server.ready: { port: ${port} }`)
})
