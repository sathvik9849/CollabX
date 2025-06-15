/*
    Establishes Redis connection
*/

const Redis = require('ioredis');
const config = require('../config/config');

const { port, host, password } = config.redis;
const redis = new Redis({ host, port,password});

module.exports = redis;
