const express = require('express')
const tinylru = require('tiny-lru')
const { info, error } = require('@usermirror/log')
const { help, incr, Gauge } = require('@usermirror/metrics')
const { track } = require('../utils/analytics')
const { wrap } = require('../utils/async')
const config = require('../utils/config')

// https://go.helpusersvote.com/v1/example.com/home-page

const MAX_ITEMS = 1000
const router = express.Router()
const LRU = tinylru(
  // max items
  MAX_ITEMS,
  // notify
  false,
  // ttl = 2 minutes
  1000 * 60 * 60
)

const partnerId = process.env.VDO_PARTNER_ID || '899439'
const lruGauge = new Gauge({
  name: 'go_helpusersvote_lru_size',
  help: 'Number of elements in last recently used cache'
})

help('redirect_cache_hit', 'Number of cached redirects')
help('redirect_cache_miss', 'Number of uncached redirects')
help('redirect_fail', 'Number of failed redirects')
help('redirect_success', 'Number of successful redirects')
help('redirect_success_href', 'Number of successful redirects per url')
help('redirect_success_generated', 'Number of generated redirects')

async function getCtaHref(namespaceId, configId) {
  const key = [namespaceId, configId].join(':')
  const cachedValue = LRU.get(key)
  const campaignQuery = Buffer.from(key).toString('base64')
  const defaultHref = `https://verify.vote.org/?partner=${partnerId}&campaign=${campaignQuery}`

  lruGauge.set(LRU.length)

  if (cachedValue) {
    info('config.cache.hit:', { key, value: cachedValue })
    incr('redirect_cache_hit', {
      namespace: namespaceId,
      campaign: configId
    })

    return {
      ok: true,
      href: cachedValue
    }
  }

  info('config.cache.miss', { key })
  incr('redirect_cache_miss', {
    namespace: namespaceId,
    campaign: configId
  })

  try {
    const { ctaHref } = await config.get({ namespaceId, configId })

    if (!ctaHref) {
      info('config.get.not_found', { key })
      incr('redirect_success_generated', {
        namespace: namespaceId,
        href: defaultHref
      })
      setTimeout(() => LRU.set(key, defaultHref), 0)

      return {
        ok: true,
        href: defaultHref
      }
    }

    setTimeout(() => LRU.set(key, ctaHref), 0)

    return {
      ok: true,
      href: ctaHref
    }
  } catch (err) {
    error(`config.get.error: ${err.message}`)
    return {
      ok: false,
      href: defaultHref
    }
  }
}

async function redirect(req, res) {
  const { params, query } = req
  const { namespace, campaign } = params
  const region = query.region || query.r
  const { ok, href } = await getCtaHref(namespace, campaign)

  const props = {
    campaign
  }

  if (region) {
    props.region = region
  }

  if (ok) {
    incr('redirect_success', { namespace })
    incr('redirect_success_href', { href })
  } else {
    incr('redirect_fail', { namespace })
    incr('redirect_fail_href', { href })
  }

  info('redirect.routed', { namespace, campaign, href })

  track({
    namespace,
    name: 'CTA Clicked',
    props
  })

  return res.redirect(href)
}

router.get('/:namespace/:campaign', wrap(redirect))

// expose handlers
router.handler = wrap(redirect)

module.exports = router
