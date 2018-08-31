const { Router } = require('express')
const { wrap } = require('../utils/async')
const { fetchStats } = require('../utils/stats')

// Create `/reports` endpoints router
const reports = Router()
const readKey = process.env.REPORT_API_READ_KEY

reports.use(
  '/reports',
  wrap(async (req, res) => {
    if (!readKey || readKey !== req.headers['x-report-read-key']) {
      return res.json({
        error: {
          code: 'unauthorized',
          message: 'Missing read key to view reports'
        }
      })
    }

    const reqBody = req.body || {}
    const reqParams = req.query || {}

    const nid = reqBody.nid || reqParams.nid
    const period = reqBody.period || reqParams.period

    if (req.method !== 'GET') {
      return res.json({
        error: {
          code: 'invalid_method',
          message: 'This endpoint only responds to GET'
        }
      })
    }

    console.log(`v1.report: { nid: ${nid || 'none'} }`)

    const stats = await fetchStats({
      nid,
      events: ['view', 'click', 'conversion'],
      period
    })

    res.json({ stats })
  })
)

module.exports = reports
