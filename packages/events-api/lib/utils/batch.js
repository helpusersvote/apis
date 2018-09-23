const { flatten, get, snakeCase } = require('lodash')
const { incr } = require('./redis')

module.exports = {
  processEventBatch
}

async function processEventBatch(batch, metadata) {
  // TODO: use metadata for determining write access pattern
  console.log('\nprocessing batch of messages:')
  console.log(batch)
  console.log('\n')
  return await Promise.all(
    flatten(batch.map(event => generateEventAggregates(event)))
  )
}

function generateEventAggregates(event) {
  const namespaceId = event.nsc_id || 'demo'
  const messageId = event.msg_id
  const timestamp = event.ts
  const eventName = event.name || 'View'

  let region = get(event, 'props.region')
  let campaignId = get(event, 'props.campaign')

  const logEvent = {
    nsc_id: namespaceId,
    msg_id: messageId,
    event: eventName,
    timestamp: timestamp || 'right now'
  }

  if (region) {
    region = region.toLowerCase()
    logEvent.region = region
  }

  if (campaignId) {
    campaignId = campaignId.toLowerCase()
    logEvent.campaign = campaignId
  }

  // console.log('v1.events.track:', logEvent)

  const eventKeys = getEventKeys({
    namespaceId,
    campaignId,
    timestamp,
    event: eventName,
    periods: ['hour', 'minute'],
    region
  })

  return eventKeys.map(eventKey => incr(eventKey, messageId))
}

// Generate multiple keys for KV-store to update aggregates
function getEventKeys({
  namespaceId,
  campaignId,
  messageId,
  event,
  region,
  timestamp,
  periods = ['hour']
}) {
  const keys = []

  event = snakeCase(event)

  periods.forEach(periodType => {
    if (region) {
      // add non-region event key
      keys.push(
        getEventKey({
          namespaceId,
          campaignId,
          event,
          timestamp,
          periodType
        })
      )
    }

    keys.push(
      getEventKey({
        namespaceId,
        campaignId,
        event,
        region,
        timestamp,
        periodType
      })
    )
  })

  keys.push(
    getEventKey({
      namespaceId,
      campaignId,
      event
    })
  )

  return keys
}

// Generate key for KV-store to update aggregates
function getEventKey({
  namespaceId,
  campaignId,
  event,
  region,
  timestamp,
  periodType = 'minute'
}) {
  let d = new Date()
  let timeKey = ''

  try {
    if (timestamp) {
      d = new Date(timestamp)
    }

    // Clear minutes/seconds/milliseconds
    d.setSeconds(0)
    d.setMilliseconds(0)

    if (periodType === 'hour' || periodType === 'day') {
      d.setMinutes(0)
    }

    if (periodType === 'day') {
      d.setHours(0)
    }

    if (!timeKey) {
      timeKey = d.getTime()
    }
  } catch (err) {
    if (err) {
      console.error(err)
    }
    // silence error, if invalid date
  }

  return [namespaceId, campaignId, event, region, periodType, timeKey]
    .filter(Boolean)
    .join(':')
}
