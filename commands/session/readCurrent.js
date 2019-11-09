const sendJsonResponse = require('../../modules/sendJsonResponse')
const setCrossDomainOriginHeaders = require('../../modules/setCrossDomainOriginHeaders')

module.exports = function ({ db }) {
  return async function (request, response, params) {
    try {
      setCrossDomainOriginHeaders(request, response)

      const session = await db.get(
        'SELECT * FROM sessions WHERE id = ? AND secret = ?',
        [request.headers['x-session-id'], request.headers['x-session-secret']]
      )

      if (!session) {
        return sendJsonResponse(401, { error: 'unauthorised' }, response)
      }

      const user = await db.get(
        'SELECT * FROM users WHERE id = ? ',
        [session.user_id]
      )

      delete user.password

      sendJsonResponse(200, {
        sessionId: session.id,
        user
      }, response)
    } catch (error) {
      console.log(error)
      sendJsonResponse(500, {}, response)
    }
  }
}
