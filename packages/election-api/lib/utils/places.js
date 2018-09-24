const { getExamplePlace } = require('./place-backends/example')
const { useBackend } = require('./place-backends')
const { info } = require('@usermirror/log')
const { track } = require('./analytics')
const { parse } = require('./address')

const getAddress = ({ query, body }) => {
  if (query) {
    const { address } = query

    if (typeof address === 'string') {
      return parse(address)
    } else {
      return address || {}
    }
  } else if (body) {
    const { address } = body

    if (typeof address === 'string') {
      return parse(address)
    } else {
      return address || {}
    }
  }

  return {}
}

function normalizePlace({ address, place }) {
  if (!place || !place.address || !place.address.line1) {
    return getExamplePlace({ id: '6dc88eace07c', address })
  }

  return place
}

async function findPollingPlace({ address, backend: backendType }) {
  const backend = useBackend(backendType)

  info('election-api.places.find:', { backend: backendType })

  track({
    name: 'Polling Place Searched',
    props: {
      backend: backendType,
      state: address.state
    }
  })

  return await backend
    .fetchPollingPlace({ address })
    .then(place =>
      normalizePlace({
        address,
        place
      })
    )
    .then(place => {
      track({
        name: 'Polling Place Found',
        props: {
          backend: backendType,
          state: address.state
        }
      })

      return place
    })
}

module.exports = {
  getAddress,
  normalizePlace,
  getExamplePlace,
  findPollingPlace
}
