const parseJsonBody = require('../../modules/parseJsonBody')
const sendJsonResponse = require('../../modules/sendJsonResponse')
const parseSession = require('../../modules/sessions')

module.exports = function ({ db }) {
  return async function (req, res, params) {
    const data = await parseJsonBody(req)
    const session = await parseSession(req)

    if (!session) {
      return sendJsonResponse(401, { errors: { id: 'invalid session provided' } }, res)
    }

    const existing = await db.get('SELECT * FROM databases WHERE name = ?', [data.name])
    if (existing) {
      return sendJsonResponse(422, { errors: { id: 'already taken' } }, res)
    }

    res.writeHead(201, {
      'Content-Type': 'application/json'
    })
    res.end(JSON.stringify(data))
  }
}
