const axios = require('axios')
const https = require('https')

module.exports = axios.create({
  baseURL: 'http://localhost:8000/',
  validateStatus: status => status < 500
})
