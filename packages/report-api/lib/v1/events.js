const { Router } = require('express')
const { wrap } = require('../utils/async')
const { get, incr } = require('../utils/redis')
const analyticsId = require('analytics-id')

// Create `/events` endpoints router
const events = Router()

events.use(
  '/events',
  wrap(async (req, res) => {
    const reqBody = req.body || {}
    const reqParams = req.query || {}

    const nid = reqBody.nid || reqParams.nid
    const event = reqBody.e || reqParams.e || 'view'
    const timestamp = reqBody.timestamp || reqParams.timestamp
    const lookup = reqParams.lookup || ''

    // If it's a GET, return current # of pageviews
    if (req.method === 'GET') {
      if (!lookup) {
        return res.json({
          error: {
            code: 'invalid_method',
            message: 'This endpoint only responds to POST'
          }
        })
      }

      console.log(
        `v1.events.lookup: { nid: ${nid ||
          'none'}, event: ${event}, lookupTimestamp: ${lookup} }`
      )

      const eventKey = getEventKey({ nid, event, timestamp, lookup })
      const value = await get(eventKey)
      const views = parseInt(value || 0, 10)

      return res.json({ views })
    }

    const messageId = reqBody.mid || reqParams.mid || analyticsId()

    console.log(
      `v1.events.track: { mid: ${messageId}, nid: ${nid ||
        'none'}, event: ${event}, timestamp: ${timestamp || 'right now'} }`
    )

    const eventMinuteKey = getEventKey({ nid, event, timestamp, lookup })
    const eventHourKey = getEventKey({
      nid,
      event,
      periodType: 'hour',
      timestamp,
      lookup
    })

    await incr(eventMinuteKey, messageId)
    await incr(eventHourKey, messageId)

    return res.json({ done: true })
  })
)

function getEventKey({
  nid,
  event,
  timestamp,
  periodType = 'minute',
  lookup: lookupTimestamp
}) {
  let d = new Date()
  let timeKey = lookupTimestamp || ''

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

  return [nid, event, periodType, timeKey].filter(Boolean).join(':')
}

module.exports = events
