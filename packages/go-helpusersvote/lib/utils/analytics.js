const { info, error } = require('@usermirror/log')
const { post } = require('axios')
const Event = require('analytics-event').withOptions({
  format: 'short'
})

const { EVENTS_API_HOST = 'http://events-api' } = process.env
const queue = []

module.exports = { track }

function track(event) {
  queue.push(Event(event))
}

// Send events in batch every 200ms
setInterval(() => {
  // Get batch of 100 events
  const events = queue.splice(0, 100)

  if (!events || events.length == 0) {
    return
  }

  if (queue.length > 0) {
    info('analytics.queue.overflow', { count: queue.length })
  }

  info('analytics.queue.flush', { count: events.length })

  post(EVENTS_API_HOST + '/v1/track', {
    events
  }).catch(err => {
    error(`analytics.queue.flush.error: ${err.message}`)
  })
}, 200)
