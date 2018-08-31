const { Router } = require('express')
const { getAddress, getExamplePlace } = require('../utils/places')

const app = Router()

app.get('/polling-places', (req, res) => {
  const { query } = req
  const homeAddress = getAddress({ query })

  return res.json({
    place: getExamplePlace({ id: '6dc88eace07c', address: homeAddress })
  })
})

app.post('/polling-places', (req, res) => {})

app.post('/polling-places/batch', (req, res) => {
  const { places } = req.body

  return res.json({ places })
})

module.exports = app
