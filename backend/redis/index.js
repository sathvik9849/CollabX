/*
    Establishes Redis connection
*/

// const Redis = require('ioredis');
// const config = require('../config/config');

// const { port, host, password } = config.redis;
// const redis = new Redis({ host, port,password});

// module.exports = redis;

const Redis = require('ioredis');
const config = require('../config/config');

const redis = new Redis({
  host: config.redis.host,
  port: config.redis.port,
  password: config.redis.password,
  tls: {}, // ← forces ioredis to use rediss://
});

redis.on('connect', () => {
  console.log('✅ Redis connected');
});

redis.on('error', (err) => {
  console.error('❌ Redis error:', err);
});

module.exports = redis;