const righto = require('righto');
const createServer = require('../../server');

const testConfig = {
  rqliteAddr: 'http://localhost:4001',
  secret: 'the-secret-number',
  passwordHashIterations: 1
};

function createServerWithDefaults (config) {
  return righto(createServer, {
    ...testConfig,
    ...config
  });
}

module.exports = createServerWithDefaults;
