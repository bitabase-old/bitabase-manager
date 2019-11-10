const config = {
  dev: {
    dataPath: './data',
    port: 8081,
    allowedCrossOriginDomains: [
      'http://localhost:8080'
    ]
  },

  production: {
    dataPath: '/var/data',
    port: 80,
    allowedCrossOriginDomains: [
      'https://bitabase.com',
      'https://www.bitabase.com'
    ]
  }
}

module.exports = config[process.env.NODE_ENV || 'dev']
