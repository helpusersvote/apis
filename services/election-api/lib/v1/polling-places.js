const { getAddress, findPollingPlace } = require('../utils/places')
const { help, incr } = require('@usermirror/metrics')
const { info, error } = require('@usermirror/log')
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

help('polling_place_lookup', 'Number of polling place lookup attempts')
help(
  'polling_place_lookup_success',
  'Number of successful polling place lookup attempts'
)
help(
  'polling_place_lookup_fail',
  'Number of failed polling place lookup attempts'
)

function servePollingPlace(lookupKey) {
  return wrap(async (req, res) => {
    const lookupValue = req[lookupKey]
    const homeAddress = getAddress({ [lookupKey]: lookupValue })

    incr('polling_place_lookup')

    try {
      const place = await findPollingPlace({
        address: homeAddress,
        backend: getPlaceBackend()
      })

      incr('polling_place_lookup_success')

      return res.json({
        place
      })
    } catch (err) {
      incr('polling_place_lookup_fail')
      error('polling place lookup failed', { error: err.message })
      return res.json({
        error: {
          code: 'failed',
          message: 'Please confirm this address is correct'
        }
      })
    }
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
