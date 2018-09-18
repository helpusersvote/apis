const { getAddress, findPollingPlace } = require('../utils/places')
const { Router } = require('express')
const { wrap } = require('../utils/async')

const app = Router()

function getPlaceBackend() {
  if (process.env.IS_ONPREM) {
    return 'onprem'
  } else if (process.env.GOOGLE_API_KEY) {
    return 'google'
  } else {
    return 'example'
  }
}

function servePollingPlace(lookupKey) {
  return wrap(async (req, res) => {
    const lookupValue = req[lookupKey]
    const homeAddress = getAddress({ [lookupKey]: lookupValue })
    const place = await findPollingPlace({
      address: homeAddress,
      backend: getPlaceBackend()
    })

    return res.json({
      place
    })
  })
}

app.get('/polling-places', servePollingPlace('query'))
app.post('/polling-places', servePollingPlace('body'))

app.post(
  '/polling-places/batch',
  wrap(async (req, res) => {
    const { addresses } = req.body

    if (!addresses || addresses.length === 0) {
      return res.status(400).json({
        error: {
          code: 'missing_required_input',
          message: 'Missing `.addresses` in request body JSON'
        }
      })
    }

    const promises = addresses.map(address =>
      findPollingPlace({
        address,
        backend: getPlaceBackend()
      })
    )
    const places = await Promise.all(promises)

    return res.json({ places })
  })
)

module.exports = app
