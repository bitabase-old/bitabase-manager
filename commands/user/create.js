const parseJsonBody = require('../../modules/parseJsonBody')
const sendJsonResponse = require('../../modules/sendJsonResponse')
const sqlite = require('sqlite')

function validate (data) {
  const validations = [
    { email: data.email ? '' : 'email is a required field' },
    { password: data.password ? '' : 'password is a required field' }
  ].filter(item => !!Object.values(item)[0])

  if (validations.length > 0) {
    return Object.assign.apply(null, validations)
  }
}

async function createUser (data) {
  const db = await sqlite.open('./data/manager.sqlite')

  await db.run(`CREATE TABLE users (id INT, email TEXT, password TEXT)`)
  await db.close()

  return true
}

module.exports = async function (req, res, params) {
  const data = await parseJsonBody(req)

  const errors = validate(data)

  if (errors) {
    return sendJsonResponse(422, { errors }, res)
  }

  createUser(data)

  sendJsonResponse(200, { email: data.email }, res)
}
