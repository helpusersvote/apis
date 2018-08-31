const range = n => Array.from({ length: n }, (_, key) => key)

exports.getLast = n => {
  const calc = ({ type }) =>
    range(n).map((_, index) => {
      const d = new Date()

      // Clear minutes/seconds/milliseconds
      d.setMilliseconds(0)
      d.setSeconds(0)

      if (type === 'days') {
        d.setMinutes(0)
        d.setHours(0)
        d.setDate(d.getDate() - index)
      } else if (type === 'hours') {
        d.setMinutes(0)
        d.setHours(d.getHours() - index)
      } else if (type === 'minutes') {
        d.setMinutes(d.getMinutes() - index)
      }

      return d.getTime()
    })

  return {
    days: () => calc({ type: 'days' }),
    hours: () => calc({ type: 'hours' }),
    minutes: () => calc({ type: 'minutes' })
  }
}
