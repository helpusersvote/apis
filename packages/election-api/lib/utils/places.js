const id = props => props.id || ''

const examples = {
  '6dc88eace07c': {
    name: 'Bella Salon',
    line1: '2248 Mission St',
    city: 'San Francisco',
    state: 'CA',
    zip: '94110',
    startDate: '11/06/2018',
    endDate: '11/06/2018',
    pollingHours: '8am - 6pm',
    lat: 37.761059,
    lng: -122.419672
  }
}
const getFromExample = (id, key) =>
  examples[id] ? examples[id][key] : undefined
const getFromAddress = (props, key) =>
  props.address ? props.address[key] : undefined

const simpleExampleGetter = (props, key) => getFromExample(props.id, key)
const complexExampleGetter = (props, key) =>
  getFromAddress(props, key) || getFromExample(props.id, key)

const line1 = props => simpleExampleGetter(props, 'line1')
const line2 = props => simpleExampleGetter(props, 'line2')
const line3 = props => simpleExampleGetter(props, 'line3')
const city = props =>
  simpleExampleGetter(props, 'line4') || simpleExampleGetter(props, 'city')

const state = props => complexExampleGetter(props, 'state')
const zip = props => complexExampleGetter(props, 'zip')

const name = props => simpleExampleGetter(props, 'name') || ''
const notes = props => simpleExampleGetter(props, 'sources') || ''
const startDate = props => simpleExampleGetter(props, 'startDate')
const endDate = props => simpleExampleGetter(props, 'endDate')
const pollingHours = props => simpleExampleGetter(props, 'pollingHours') || ''

const locationName = props => simpleExampleGetter(props, 'locationName')
const voterServices = props => simpleExampleGetter(props, 'voterServices')

const lat = props => simpleExampleGetter(props, 'lat')
const lng = props => simpleExampleGetter(props, 'lng')

const sources = props =>
  simpleExampleGetter(props, 'sources') || [
    {
      name: 'Voting Information Project',
      official: true
    }
  ]

const getExamplePlace = (props = { id: 1 }) => ({
  id: id(props),
  address: {
    locationName: locationName(props),
    line1: line1(props),
    line2: line2(props),
    line3: line3(props),
    city: city(props),
    state: state(props),
    zip: zip(props)
  },
  notes: notes(props),
  pollingHours: pollingHours(props),
  name: name(props),
  voterServices: voterServices(props),
  startDate: startDate(props),
  endDate: endDate(props),
  sources: sources(props),
  lat: lat(props),
  lng: lng(props)
})

const getAddress = ({ query }) => {
  if (query) {
    const { address } = query

    if (typeof address === 'string') {
      // TODO: parse address
      return {}
    } else {
      return address
    }
  }
}

module.exports = {
  getAddress,
  getExamplePlace
}
