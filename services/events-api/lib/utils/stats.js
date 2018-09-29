const { info, error } = require('@usermirror/log')
const { get, scan } = require('./redis')
const { getLast } = require('./time')
const { flatten } = require('lodash')

async function fetchStats({ type, namespace, events, period }) {
  if (type === 'realtime') {
    return await fetchRealtimeStats({ namespace })
  }

  info('v1.reports.fetchStats', { namespace, events, period })

  const stats = {}
  const keysPerEvent = await Promise.all(
    events.map(async event => {
      const eventPrefix = `${namespace}::event:${event}::${period}:*`
      const [cursor, keys] = await scan(
        0, // start at beginning
        'match',
        eventPrefix,
        'count',
        1000000 // scan the first 1m keys
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
              eventCountFactory({
                namespace,
                event,
                period: 'hour',
                validTimestamps
              })
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

function eventCountFactory({
  namespace,
  key,
  event,
  period,
  validTimestamps = []
}) {
  return async timestamp => {
    const valid = validTimestamps.includes('' + timestamp) ? true : undefined
    let value = 0

    if (valid) {
      value = parseInt(
        (await get(
          key || `${namespace}::event:${event}::${period}:${timestamp}`
        )) || 0,
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

async function fetchRealtimeStats({ namespace }) {
  const getEventKey = ts => `${namespace}::event:*::minute:${ts}`

  const minuteKeys = await Promise.all(
    getLast(15)
      .minutes()
      .map(getEventKey)
      .map(async key => {
        const [_, keys] = await scan(
          0, // start at beginning
          'match',
          key,
          'count',
          100000 // scan the first 100k keys
        )
        return { keys }
      })
  )

  const eventKeys = flatten(minuteKeys.map(({ keys }) => keys))

  if (eventKeys.length === 0) {
    info('v1.report.realtime: no keys found', { namespace })
    return {
      usersHelped: 0
    }
  }

  info('v1.report.realtime: redis get', { namespace, eventKeys })
  const users_helped = await get(...eventKeys)

  return {
    users_helped
  }
}

module.exports = { fetchStats, fetchRealtimeStats }
