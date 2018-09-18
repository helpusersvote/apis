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

// Send events in batch every 5 seconds
setInterval(() => {
  // Get batch of 100 events
  const events = queue.splice(0, 100)

  if (!events || events.length == 0) {
    return
  }

  if (queue.length > 0) {
    console.log('analytics.queue.overflow: ' + queue.length)
  }

  console.log(`analytics.queue.flush: ${events.length} events`)

  post(EVENTS_API_HOST + '/v1/track', {
    events
  }).catch(() => {
    console.error('analytics.queue.flush.error: events-api unavailable')
  })
}, 5000)
