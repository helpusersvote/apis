const { flatten, get, snakeCase } = require('lodash')
const { track } = require('./analytics')
const { incr } = require('./redis')
const errors = require('./errors')

module.exports = {
  processEventBatch
}

async function processEventBatch(batch, metadata) {
  return await Promise.all(
    flatten(
      batch.map(event =>
        Promise.all(
          flatten([sendToSegment(event), generateEventAggregates(event)])
        )
      )
    )
  )
}

function sendToSegment(event) {
  try {
    track(event)
  } catch (err) {
    errors.captureException(err)
  }

  return Promise.resolve()
}

function generateEventAggregates(event) {
  const namespaceId = event.nsc_id || 'demo'
  const messageId = event.msg_id
  const timestamp = event.ts
  const eventName = event.name || 'CTA Viewed'

  let age = get(event, 'props.age')
  let region = get(event, 'props.region') || get(event, 'props.state')
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

  const eventKeys = getEventKeys({
    namespaceId,
    campaignId,
    timestamp,
    event: eventName,
    periods: ['hour', 'minute'],
    region,
    age
  })

  return eventKeys.map(eventKey => incr(eventKey, messageId))
}

// Generate multiple keys for KV-store to update aggregates
function getEventKeys({
  age,
  event,
  region,
  timestamp,
  campaignId,
  namespaceId,
  periods = ['hour']
}) {
  const keys = []

  event = snakeCase(event)

  periods.forEach(periodType => {
    if (age) {
      keys.push(
        getEventKey({
          namespaceId,
          campaignId,
          age,
          event,
          timestamp,
          periodType
        })
      )
    }

    if (region) {
      if (age) {
        keys.push(
          getEventKey({
            namespaceId,
            campaignId,
            age,
            event,
            region,
            timestamp,
            periodType
          })
        )
      }
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

      keys.push(
        getEventKey({
          namespaceId,
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

    keys.push(
      getEventKey({
        namespaceId,
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
      event
    })
  )

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

  let eventKey = [namespaceId, campaignId].filter(Boolean).join(':')

  if (region) {
    eventKey += `::region:${region}`
  }

  if (event) {
    eventKey += `::event:${event}`
  }

  if (periodType && timeKey) {
    eventKey += `::${periodType}:${timeKey}`
  }

  return eventKey
}
