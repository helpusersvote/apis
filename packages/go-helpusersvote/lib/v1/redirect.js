const express = require('express')
const tinylru = require('tiny-lru')
const PrettyError = require('pretty-error')
const { track } = require('../utils/analytics')
const { wrap } = require('../utils/async')
const config = require('../utils/config')

// https://go.helpusersvote.com/v1/example.com/home-page

const router = express.Router()
const LRU = tinylru(
  // max items
  1000,
  // notify
  false,
  // ttl = 2 minutes
  1000 * 60 * 60
)

const pe = new PrettyError()
const partnerId = process.env.VDO_PARTNER_ID || ''

async function getCtaHref(namespaceId, configId) {
  const key = [namespaceId, configId].join(':')
  const cachedValue = LRU.get(key)
  const campaignQuery = Buffer.from(key).toString('base64')

  if (cachedValue) {
    console.log('config.cache.hit:', key)

    return cachedValue
  }

  console.log('config.cache.miss:', key)

  try {
    const { ctaHref } = await config.get({ namespaceId, configId })

    if (!ctaHref) {
      console.log('config.get.not_found:', key)
      const defaultURL = `https://verify.vote.org/?partner=${partnerId}&campaign=${campaignQuery}`
      setTimeout(() => LRU.set(key, defaultURL), 0)

      return defaultURL
    }

    setTimeout(() => LRU.set(key, ctaHref), 0)

    return ctaHref
  } catch (err) {
    console.log('config.get.error:\n')
    console.log(pe.render(err))
    return `https://verify.vote.org/?partner=${partnerId}&campaign=${campaignQuery}`
  }
}

async function redirect(req, res) {
  const { params, query } = req
  const { namespace, campaign } = params
  const region = query.region || query.r
  const href = await getCtaHref(namespace, campaign)

  const props = {
    campaign
  }

  // TODO: Detect State from GeoIP based on Cloudflare
  if (region) {
    props.region = region
  }

  track({
    namespace,
    name: 'Click',
    props
  })

  return res.redirect(href)
}

router.get('/:namespace/:campaign', wrap(redirect))

// expose handlers
router.handler = wrap(redirect)

module.exports = router
