const axios = require('axios');

module.exports = axios.create({
  baseURL: 'http://localhost:8001/',
  validateStatus: status => status < 500
});
