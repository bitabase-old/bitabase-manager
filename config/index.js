module.exports = {
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
};
