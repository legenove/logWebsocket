'use strict'
const merge = require('webpack-merge')
const prodEnv = require('./prod.env')

module.exports = merge(prodEnv, {
  NODE_ENV: '"development"',
  // API_HOST: '"http://apis-puzzle-test.zaih.com"', // in test
  // API_HOST: '"localhost:8080"',  // in dev
  API_HOST: '""' // 有代理，无需设置
})
