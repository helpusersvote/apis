const redis = require('redis')
const { promisify } = require('util')

const isProd = process.env.NODE_ENV === 'production'
const defaultRedisHost = isProd ? 'huv-redis-master' : 'localhost'
const redisHost = process.env.REDIS_HOST || defaultRedisHost
const client = redis.createClient({ host: redisHost, port: 6379 })

client.on('error', () => {
  // silence redis connection error
  console.error('redis.connect: failed')
})

// Promisify redis client to work with async/await
const expire = promisify(client.expire).bind(client)
const get = promisify(client.pfcount).bind(client)
const incr = promisify(client.pfadd).bind(client)
const scan = promisify(client.scan).bind(client)

module.exports = {
  expire,
  get,
  incr,
  scan
}
