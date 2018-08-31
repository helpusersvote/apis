const express = require('express')
const hashlru = require('hashlru')
const { wrap } = require('../utils/async')
const config = require('../utils/config')

// https://go.helpusersvote.com/v1/namespace/config

const router = express.Router()
const LRU = hashlru(1000)

async function getCtaHref(namespaceId, configId) {
  const key = [namespaceId, configId].join('::')
  const cachedValue = LRU.get(key)

  if (cachedValue) {
    console.log('config.cache: hit', key)
    return cachedValue
  }

  console.log('config.cache: miss', key)

  try {
    const { ctaHref } = await config.get({ namespaceId, configId })

    if (!ctaHref) {
      console.log('config.not_found:', key)
      return 'https://vote.org'
    }

    setTimeout(() => LRU.set(key, ctaHref), 0)

    return ctaHref
  } catch (err) {
    console.log('config.error:')
    console.error(err)
    return 'https://vote.org'
  }
}

async function redirect(req, res) {
  const { namespace, campaign } = req.params
  const href = await getCtaHref(namespace, campaign)

  return res.redirect(href)
}

router.get('/:namespace/:campaign', wrap(redirect))

module.exports = router
