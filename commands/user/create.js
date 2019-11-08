const hashText = require('pbkdf2-wrapper/hashText')

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

async function insertUser (db, data) {
  const password = await hashText(data.password)

  await db.run(
    'INSERT INTO users (email, password) VALUES (?, ?)',
    [data.email, password]
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

      await insertUser(db, data)

      sendJsonResponse(200, { email: data.email }, res)
    } catch (error) {
      console.log(error)
      sendJsonResponse(500, {}, res)
    }
  }
}
