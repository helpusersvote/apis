const { processEventBatch } = require('../utils/batch')
const { wrap } = require('../utils/async')
const { isArray } = require('lodash')
const { Router } = require('express')
const AnalyticsEvent = require('analytics-event')

// Create `/events` endpoints router
const track = Router()
const Event = AnalyticsEvent.withOptions({ format: 'short' })

track.post(
  '/track',
  wrap(async (req, res) => {
    const body = req.body || {}
    const { events = [], metadata = {}, ...event } = body

    if (events && !isArray(events)) {
      return res.status(400).json({
        error: {
          code: 'invalid_request',
          message: 'Body value `events` should be an array'
        }
      })
    }

    if (Object.keys(event).length > 0) {
      events.push(event)
    }

    await processEventBatch(events.map(Event))

    return res.json({ done: true })
  })
)

module.exports = track
