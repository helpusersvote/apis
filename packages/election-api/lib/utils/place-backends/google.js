const { get } = require('axios')
const { stringify } = require('../address')
const { getExamplePlace } = require('./example')

const apiKey = process.env.GOOGLE_API_KEY || ''
const defaultElectionId = '2000'
const voterInfoEndpoint =
  'https://content.googleapis.com/civicinfo/v2/voterinfo'

module.exports = { fetchPollingPlace }

async function fetchPollingPlace({ address, electionId = defaultElectionId }) {
  const addr = encodeURIComponent(stringify(address))
  const qs = `?address=${addr}&key=${apiKey}&electionId=${electionId}`

  try {
    const { pollingLocations } = await get(voterInfoEndpoint + qs).then(
      r => r.data
    )

    if (!pollingLocations) {
      console.log('election-api.google.error: missing pollingLocations')
      return getExamplePlace({ id: '6dc88eace07c', address })
    }

    if (pollingLocations.length === 0) {
      console.log('election-api.google.error: no pollingLocations found')
      return getExamplePlace({ id: '6dc88eace07c', address })
    }

    return pollingLocations[0]
  } catch (err) {
    const { response } = err
    console.log('election-api.google.error: ')

    if (response) {
      if (response.data) {
        throw new Error(JSON.stringify(response.data, null, 2))
      }
    }

    throw err
  }
}
