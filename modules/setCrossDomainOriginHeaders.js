const config = require('../config')

const setCrossDomainOriginHeaders = (request, response) => {
  if (config.allowedCrossOriginDomains.includes(request.headers.origin)) {
    response.setHeader('Access-Control-Allow-Origin', '*')
    response.setHeader('Access-Control-Allow-Headers', [
      'Origin',
      'X-Requested-With',
      'Content-Type',
      'Accept',
      'X-Session-Id',
      'X-Session-Secret'
    ].join(', '))
  }
}

module.exports = setCrossDomainOriginHeaders
