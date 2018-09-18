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
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'Missing read key to view reports'
        }
      })
    }

    const reqBody = req.body || {}
    const reqParams = req.query || {}

    const nid =
      reqBody.nid || reqParams.nid || reqBody.namespace || reqParams.namespace
    const period = reqBody.period || reqParams.period

    console.log(`v1.report: { nid: ${nid || 'none'} }`)

    const stats = await fetchStats({
      nid,
      events: [
        'view',
        'click',
        'voter_registration_checked',
        'voter_registration_started'
      ],
      period
    })

    res.json({ stats })
  })
)

module.exports = reports
