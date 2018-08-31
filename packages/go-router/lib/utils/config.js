const Config = require('config-client')

const isProd = process.env.NODE_ENV === 'production'
const defaultApiHost = `http://${
  isProd ? 'embed-config-api' : 'localhost:8888'
}`

// Pass in the cluster's config-api
const host = process.env.CONFIG_API_HOST || defaultApiHost
// Pass in default namespace if it's set
const namespaceId = process.env.CONFIG_API_NAMESPACE

module.exports = new Config({ host, namespaceId })
