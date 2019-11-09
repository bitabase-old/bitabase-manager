const uuidv4 = require('uuid/v4')
const verifyHash = require('pbkdf2-wrapper/verifyHash')

const createRandomString = require('../../modules/createRandomString')
const parseJsonBody = require('../../modules/parseJsonBody')
const sendJsonResponse = require('../../modules/sendJsonResponse')

module.exports = function ({ db }) {
  return async function (req, res, params) {
    try {
      const data = await parseJsonBody(req)

      const session = await db.get(
        'SELECT * FROM sessions WHERE id = ? AND secret = ?',
        [req.headers['x-session-id'], req.headers['x-session-secret']]
      )

      if (!session) {
        return sendJsonResponse(401, { error: 'unauthorised' }, res)
      }

      const user = await db.get(
        'SELECT * FROM users WHERE id = ? ',
        [session.user_id]
      )

      delete user.password

      sendJsonResponse(200, {
        sessionId: session.id,
        user
      }, res)
    } catch (error) {
      console.log(error)
      sendJsonResponse(500, {}, res)
    }
  }
}
