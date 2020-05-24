const config = {
  dev: {
    dataServer: 'http://localhost:4001',
    secret: 'not-the-closest-kept-secret-in-the-world',
    port: 8081,
    allowedCrossOriginDomains: [
      'http://localhost:8080'
    ],
    servers: [
      'http://localhost:8000'
    ]
  },

  production: {
    dataPath: '/var/data',
    secret: process.env.BB_INTERNAL_SECRET,
    port: 80,
    allowedCrossOriginDomains: [
      'https://bitabase.com',
      'https://www.bitabase.com'
    ],
    servers: (process.env.BB_INTERNAL_SERVERS || '').split(',').map(s => s.trim())
  }
};

module.exports = config[process.env.NODE_ENV || 'dev'];
