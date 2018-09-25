const { parseLocation } = require('parse-address')

const parse = addrStr => {
  const parts = parseLocation(addrStr)
  const address = {
    line1: [parts.number, parts.prefix, parts.street, parts.type]
      .filter(Boolean)
      .join(' '),
    line2: [parts.sec_unit_type, parts.sec_unit_num].filter(Boolean).join(' '),
    city: parts.city,
    state: parts.state,
    zip: parts.zip
  }

  return address
}

const stringify = address =>
  [address.line1, address.city, address.state, address.zip].join(', ')

module.exports = {
  parse,
  stringify
}
