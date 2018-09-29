const { fetchStats, fetchRealtimeStats } = require('../utils/stats')
const { info, error } = require('@usermirror/log')
const { wrap } = require('../utils/async')
const { Router } = require('express')

// Create `/reports` endpoints router
const reports = Router()
const readKey = process.env.API_READ_KEY

reports.get(
  '/reports',
  wrap(async (req, res) => {
    const reqParams = req.query || {}
    const namespace = reqParams.nid || reqParams.namespace
    const token = req.headers['x-api-read-key']

    if (!readKey || readKey !== token) {
      error('invalid auth token', { namespace, token })
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'invalid read key to view reports'
        }
      })
    }

    const { period = 'hour' } = reqParams

    info('v1.report.general', { namespace, period })

    const stats = await fetchStats({
      period,
      namespace,
      events: [
        'cta_viewed',
        'cta_clicked',
        'voter_registration_checked',
        'voter_registration_started'
      ]
    })

    res.json({ stats })
  })
)

reports.get(
  '/reports/realtime',
  wrap(async (req, res) => {
    const reqParams = req.query || {}
    const namespace = reqParams.nid || reqParams.namespace
    const token = req.headers['x-api-read-key']

    if (!readKey || readKey !== token) {
      error('invalid auth token', { namespace, token })
      return res.status(401).json({
        error: {
          code: 'unauthorized',
          message: 'invalid read key to view reports'
        }
      })
    }

    const { period = 'hour' } = reqParams

    info('v1.report.realtime', { namespace, period })

    const type = 'realtime'
    const stats = await fetchStats({
      type,
      namespace,
      events: [
        'cta_viewed',
        'cta_clicked',
        'voter_registration_checked',
        'voter_registration_started'
      ]
    })

    res.json({ stats })
  })
)

module.exports = reports
