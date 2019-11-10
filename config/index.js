const config = {
  dev: {
    port: 8081,
    allowedCrossOriginDomains: [
      'http://localhost:8080'
    ]
  },

  production: {
    port: 80,
    allowedCrossOriginDomains: [
      'https://bitabase.com',
      'https://www.bitabase.com'
    ]
  }
}

module.exports = config[process.env.NODE_ENV || 'dev']
