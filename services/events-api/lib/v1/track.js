const { processEventBatch } = require('../utils/batch')
const { help, incr } = require('@usermirror/metrics')
const { info } = require('@usermirror/log')
const { isArray } = require('lodash')
const { Router } = require('express')
const { wrap } = require('../utils/async')
const errors = require('../utils/errors')
const AnalyticsEvent = require('analytics-event')

// Create `/events` endpoints router
const track = Router()
const Event = AnalyticsEvent.withOptions({ format: 'short' })

help('v1_track_success', 'Number of successful v1 track requests')
help('v1_track_fail', 'Number of failed v1 track requests')

const handleTrack = wrap(async (req, res) => {
  const body = req.body || {}
  const { events = [], metadata = {}, ...event } = body

  if (events && !isArray(events)) {
    incr('v1_track_fail')
    info('v1.track.fail: invalid request')
    return res.status(400).json({
      error: {
        code: 'invalid_request',
        message: 'Body value `events` should be an array'
      }
    })
  }

  if (events.length === 0) {
    if (Object.keys(event).length > 0) {
      events.push(event)
    } else {
      return res.json({
        done: true,
        message: 'no events found in request'
      })
    }
  }

  res.json({ done: true })

  try {
    await processEventBatch(events.map(Event))

    incr('v1_track_success')
    info('v1.track.success: process events', {
      count: events.length
    })
  } catch (err) {
    incr('v1_track_fail')
    errors.captureException(err)
  }
})

track.post('/track', handleTrack)
track.post('/t', handleTrack)

module.exports = track
