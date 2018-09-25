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

const getProp = (props, key) => getFromExample(props.id, key)
const getPropFromAddress = (props, key) =>
  getFromAddress(props, key) || getFromExample(props.id, key)

const line1 = props => getProp(props, 'line1')
const line2 = props => getProp(props, 'line2')
const line3 = props => getProp(props, 'line3')
const city = props => getProp(props, 'line4') || getProp(props, 'city')

const state = props => getPropFromAddress(props, 'state')
const zip = props => getPropFromAddress(props, 'zip')

const name = props => getProp(props, 'name') || ''
const notes = props => getProp(props, 'sources') || ''
const startDate = props => getProp(props, 'startDate')
const endDate = props => getProp(props, 'endDate')
const pollingHours = props => getProp(props, 'pollingHours') || ''

const locationName = props => getProp(props, 'locationName')
const voterServices = props => getProp(props, 'voterServices')

const lat = props => getProp(props, 'lat')
const lng = props => getProp(props, 'lng')

const sources = props =>
  getProp(props, 'sources') || [
    {
      name: 'Voting Information Project',
      official: true
    }
  ]

const getExamplePlace = (props = { id: '6dc88eace07c' }) => ({
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
  lng: lng(props),
  example: true
})

const fetchPollingPlace = async props => getExamplePlace(props)

module.exports = {
  getExamplePlace,
  fetchPollingPlace
}
