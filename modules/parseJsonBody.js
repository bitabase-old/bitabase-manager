const getRawBody = require('raw-body')

module.exports = async req => {
  const body = await getRawBody(req)

  try {
    return JSON.parse(body)
  } catch (error) {
    return {}
  }
}
