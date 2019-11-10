const uuidv4 = require('uuid/v4')
const parseJsonBody = require('../../modules/parseJsonBody')
const sendJsonResponse = require('../../modules/sendJsonResponse')
const parseSession = require('../../modules/sessions')

module.exports = function ({ db }) {
  return async function (request, response, params) {
    const data = await parseJsonBody(request)
    const session = await parseSession(db, request)

    if (!session) {
      return sendJsonResponse(401, { errors: { id: 'invalid session provided' } }, response)
    }

    const existing = await db.get('SELECT * FROM databases WHERE name = ?', [data.name])
    if (existing) {
      return sendJsonResponse(422, { errors: { id: 'already taken' } }, response)
    }

    data.id = uuidv4()

    await db.run('INSERT INTO databases (id, name, schema, date_created) VALUES (?, ?, ?, ?)', [
      data.id, data.name, JSON.stringify(data), Date.now()
    ])

    await db.run('INSERT INTO database_users (user_id, database_id, role, date_created) VALUES (?, ?, ?, ?)', [
      session.user.id, data.id, 'owner', Date.now()
    ])

    response.writeHead(201, {
      'Content-Type': 'application/json'
    })
    response.end(JSON.stringify(data))
  }
}
