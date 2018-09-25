const { info, error } = require('@usermirror/log')
const { fetchStats } = require('../utils/stats')
const { wrap } = require('../utils/async')
const { Router } = require('express')

// Create `/reports` endpoints router
const reports = Router()
const readKey = process.env.API_READ_KEY

reports.use(
  '/reports',
  wrap(async (req, res) => {
    if (!readKey || readKey !== req.headers['x-api-read-key']) {
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

    info('v1.report', { nid })

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
