const { Router } = require('express')
const bodyParser = require('body-parser')
const httpProxy = require('express-http-proxy')
const pollingPlaces = require('./polling-places')
const stateDeadlines = require('./state-deadlines')

const defaultReportApiHost =
  process.env.NODE_ENV === 'production'
    ? 'http://huv-report-api'
    : 'http://localhost:4800'

const REPORT_API_HOST = process.env.REPORT_API_HOST || defaultReportApiHost
const reportApiProxy = httpProxy(REPORT_API_HOST)

const v1 = Router()

v1.use(bodyParser.json())
v1.use(pollingPlaces)
v1.use(stateDeadlines)
v1.use(reportApiProxy)

module.exports = v1
