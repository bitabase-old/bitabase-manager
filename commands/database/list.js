const sendJsonResponse = require('../../modules/sendJsonResponse')
const parseSession = require('../../modules/sessions')
const setCrossDomainOriginHeaders = require('../../modules/setCrossDomainOriginHeaders')

module.exports = function ({ db }) {
  return async function (request, response, params) {
    setCrossDomainOriginHeaders(request, response)

    const session = await parseSession(db, request)

    if (!session) {
      return sendJsonResponse(401, { errors: { id: 'invalid session provided' } }, response)
    }

    const sql = `
        SELECT databases.*
          FROM databases
     LEFT JOIN database_users
            ON database_users.database_id = databases.id
        WHERE database_users.user_id = ?
    `
    const databaseRecord = await db.all(sql, [session.user.id])

    if (!databaseRecord) {
      return sendJsonResponse(404, { error: 'not found' }, response)
    }

    response.writeHead(200, {
      'Content-Type': 'application/json'
    })

    response.end(JSON.stringify(databaseRecord))
  }
}
