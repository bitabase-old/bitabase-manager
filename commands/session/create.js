const uuidv4 = require('uuid/v4')
const verifyHash = require('pbkdf2-wrapper/verifyHash')

const createRandomString = require('../../modules/createRandomString')
const parseJsonBody = require('../../modules/parseJsonBody')
const sendJsonResponse = require('../../modules/sendJsonResponse')

function validate (data) {
  const validations = [
    { email: data.email ? '' : 'email is a required field' },
    { password: data.password ? '' : 'password is a required field' }
  ].filter(item => !!Object.values(item)[0])

  if (validations.length > 0) {
    return Object.assign.apply(null, validations)
  }
}

function insertSession (db, { sessionId, sessionSecret, userId }) {
  return db.run(
    'INSERT INTO sessions (id, secret, user_id) VALUES (?, ?, ?)',
    [sessionId, sessionSecret, userId]
  )
}

module.exports = function ({ db }) {
  return async function (req, res, params) {
    try {
      const data = await parseJsonBody(req)

      const errors = validate(data)
      if (errors) {
        return sendJsonResponse(422, { errors }, res)
      }

      const user = await db.get('SELECT * FROM users WHERE email = ?', [data.email])
      if (!user) {
        return sendJsonResponse(401, { error: 'unauthorised' }, res)
      }

      const passwordMatch = await verifyHash(data.password, user.password)
      if (!passwordMatch) {
        return sendJsonResponse(401, { error: 'unauthorised' }, res)
      }

      const sessionId = uuidv4()
      const sessionSecret = await createRandomString(64)
      await insertSession(db, {
        sessionId,
        sessionSecret,
        userId: user.id
      })

      delete user.password

      sendJsonResponse(200, { sessionId, sessionSecret, user }, res)
    } catch (error) {
      console.log(error)
      sendJsonResponse(500, {}, res)
    }
  }
}
