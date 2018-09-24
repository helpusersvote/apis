const { info, error } = require('@usermirror/log')
const { getExamplePlace } = require('./example')
const { stringify } = require('../address')
const { get } = require('axios')

const apiKey = process.env.GOOGLE_API_KEY || ''
const defaultElectionId = '2000'
const voterInfoEndpoint =
  'https://content.googleapis.com/civicinfo/v2/voterinfo'

module.exports = { fetchPollingPlace }

async function fetchPollingPlace({ address, electionId = defaultElectionId }) {
  const addr = encodeURIComponent(stringify(address))
  const qs = `?address=${addr}&key=${apiKey}&electionId=${electionId}`

  info('election-api.google.fetch: finding polling place', { electionId })

  try {
    const { pollingLocations } = await get(voterInfoEndpoint + qs).then(
      r => r.data
    )

    if (!pollingLocations) {
      error('election-api.google.error: missing pollingLocations')
      return getExamplePlace({ id: '6dc88eace07c', address })
    }

    if (pollingLocations.length === 0) {
      error('election-api.google.error: no pollingLocations found')
      return getExamplePlace({ id: '6dc88eace07c', address })
    }

    return pollingLocations[0]
  } catch (err) {
    const { response } = err
    error('election-api.google.error: unknown')

    if (response) {
      if (response.data) {
        if (response.data.error && response.data.error.errors) {
          throw new Error(JSON.stringify(response.data.error.errors))
        } else {
          throw new Error(JSON.stringify(response.data))
        }
      }
    }

    throw err
  }
}
