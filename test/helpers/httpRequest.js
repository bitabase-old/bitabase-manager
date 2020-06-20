const axios = require('axios');

module.exports = axios.create({
  baseURL: 'http://localhost:8000/',
  validateStatus: status => status < 500
});
