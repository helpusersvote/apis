const errors = require('./errors')
const { warn } = require('@usermirror/log')
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

function track(event) {
  const e = SegmentEvent(event, { format: 'segment' })

  analytics.track(e)
}

module.exports = {
  track
}
