const { get } = require('axios')
const { stringify } = require('../address')
const { getExamplePlace } = require('./example')

const endpoint = 'http://onprem-geo-db/v1/polling-places/find'

module.exports = { fetchPollingPlace }

async function fetchPollingPlace({ address }) {
  const addr = stringify(address)
  const qs = `?addr=${addr}`

  try {
    const { pollingLocations } = await get(endpoint + qs).then(r => r.data)

    if (!pollingLocations) {
      console.log('election-api.onprem.error: missing pollingLocations')
      return getExamplePlace({ id: '6dc88eace07c', address })
    }

    if (pollingLocations.length === 0) {
      console.log('election-api.onprem.error: no pollingLocations found')
      return getExamplePlace({ id: '6dc88eace07c', address })
    }

    console.log('election-api.onprem.success: found polling place')

    return pollingLocations[0]
  } catch (err) {
    const { response } = err

    if (response && response.data) {
      throw new Error(JSON.stringify(response.data, null, 2))
    }

    throw err
  }
}
