const config = {
  development: {
    dataServer: 'http://localhost:4001',
    secret: 'not-the-closest-kept-secret-in-the-world',
    bind: '0.0.0.0:8081',
    allowedCrossOriginDomains: [
      'http://localhost:8080'
    ],
    servers: [
      'http://localhost:8000'
    ],
    passwordHashConfig: {
      iterations: 1
    }
  },

  production: {
    dataPath: '/var/data',
    secret: process.env.BB_INTERNAL_SECRET,
    bind: '0.0.0.0:80',
    allowedCrossOriginDomains: [
      'https://bitabase.com',
      'https://www.bitabase.com'
    ],
    servers: (process.env.BB_INTERNAL_SERVERS || '').split(',').map(s => s.trim()),
    passwordHashConfig: {
      iterations: 372791
    }
  }
};

module.exports = config[process.env.NODE_ENV || 'development'];
