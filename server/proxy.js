'use strict'

const axios = require('axios')

const proxy = function (app, config) {
  const BASE_TOKEN = config.baseToken
  const HOSTS = {
    'liveme-finance': config.debug ? config.testApiHost : config.apiHost
  }

  app.use('/*liveme-finance/*', function (req, res, next) {
    const paths = req.originalUrl.split('/')
    const host = paths[1]
    paths.splice(1, 1)
    const path = paths.join('/')
    console.log('path', path)

    const cookieStr = req.headers.cookie
    let cookie = {}

    cookieStr && cookieStr.split(';').forEach((item) => {
      const list = item.split('=')
      cookie[list[0].trim()] = (list[ 1 ] || '').trim()
    })

    let token = BASE_TOKEN;

    let opts = {
      url: path,
      baseURL: HOSTS[host] + config.path,
      method: req.method,
      headers: {
        Authorization: token
      }
    };

    if (req.method.toLowerCase() === 'post' || req.method.toLowerCase() === 'put') {
      opts.data = req.body
    }

    return new Promise((resolve, reject) => {
      axios.request(opts).then(response => {
        if (typeof response.headers === 'object') {
          var hds = {}
          for (var key in response.headers) {
            hds[key] = response.headers[key]
          }
          res.set(hds)
        }

        console.log(req.method + ' ' + response.config.url + ' ' + response.status)
        res.status(response.status).send(response.data)
      }).catch(error => {
        console.log(error.response.config.url + '   error')

        if (typeof error.headers === 'object') {
          var hds = {}
          for (var key in error.headers) {
            hds[key] = error.headers[key]
          }
          res.set(hds)
        }

        if (error.response) {
          switch (error.response.status) {
            case 403:
              error.response.data.text = '暂无权限，请重新登录或更换帐号'
          }
        }

        res.status(error.response.status).send(error.response.data)
      })
    })
  })
}

module.exports = function (app, config) {
  return proxy(app, config)
}
