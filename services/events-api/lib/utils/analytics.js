const errors = require('./errors')
const { info, warn } = require('@usermirror/log')
const Analytics = require('analytics-node')
const Event = require('analytics-event')

const SegmentEvent = Event.withOptions({ format: 'segment' })
const writeKey = process.env.SEGMENT_WRITE_KEY || ''

const fakeAnalytics = {
  track: () => {
    const err = new Error('missing `SEGMENT_WRITE_KEY` for events api')
    warn(err.message)
    errors.captureException(err)
  }
}

const analytics = writeKey ? new Analytics(writeKey) : fakeAnalytics

function track(inputEvent) {
  const event = SegmentEvent(inputEvent, { format: 'segment' })

  if (event.timestamp) {
    delete event.timestamp
  }

  if (!event.userId) {
    // Attach `userId` so that the message doesn't get dropped
    event.userId = 'huv-user-' + Math.floor(Math.random() * 100000000000)
  }

  info('analytics.track', { event: event.event })
  analytics.track(event)
}

module.exports = {
  track
}
