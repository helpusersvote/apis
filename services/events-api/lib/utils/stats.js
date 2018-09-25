const { get, scan } = require('./redis')
const { getLast } = require('./time')

async function fetchStats({ nid, events, period }) {
  const stats = {}
  const keysPerEvent = await Promise.all(
    events.map(async event => {
      const eventPrefix = `${nid}:${event}:*`
      const [cursor, keys] = await scan(
        0, // start at beginning
        'match',
        eventPrefix,
        'count',
        100 // get the first 100 keys
      )

      return { cursor, event, keys }
    })
  )

  await Promise.all(
    keysPerEvent.map(async ({ event, keys }) => {
      const validTimestamps = keys.map(k => k.split(':').pop())

      if (!stats[event]) {
        stats[event] = {}
      }

      const pushStat = period => stat => stats[event][period].push(stat)

      if (period === 'minute' || !period) {
        const eventsByMinute = await Promise.all(
          getLast(30)
            .minutes()
            .map(
              eventCountFactory({ event, period: 'minute', validTimestamps })
            )
        )

        if (!stats[event].minute) {
          stats[event].minute = []
        }

        eventsByMinute.forEach(pushStat('minute'))
      }

      if (period === 'hour' || !period) {
        const eventsByHour = await Promise.all(
          getLast(12)
            .hours()
            .map(
              eventCountFactory({ nid, event, period: 'hour', validTimestamps })
            )
        )

        if (!stats[event].hour) {
          stats[event].hour = []
        }

        eventsByHour.forEach(pushStat('hour'))
      }
    })
  )

  return stats
}

function eventCountFactory({ nid, event, period, validTimestamps }) {
  return async timestamp => {
    const valid = validTimestamps.includes('' + timestamp) ? true : undefined
    let value = 0

    if (valid) {
      value = parseInt(
        (await get(`${nid}:${event}:${period}:${timestamp}`)) || 0,
        10
      )
    }

    return {
      timestamp,
      value,
      valid
    }
  }
}

module.exports = { fetchStats }
