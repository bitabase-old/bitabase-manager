const axios = require('axios');
const config = require('../../config');

module.exports = axios.create({
  baseURL: `http://localhost:${config.port}/`,
  validateStatus: status => status < 500
});
