const parseJsonBody = require('../../modules/parseJsonBody')

function sendJson (statusCode, message, res) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(message, null, 2))
}

function validate (data) {
  const validations = [
    { email: data.email ? '' : 'email is a required field' },
    { password: data.password ? '' : 'password is a required field' }
  ].filter(item => !!Object.values(item)[0])

  if (validations.length > 0) {
    return Object.assign.apply(null, validations)
  }
}

module.exports = async function (req, res, params) {
  const data = await parseJsonBody(req)

  const errors = validate(data)

  if (errors) {
    return sendJson(422, { errors }, res)
  }

  sendJson(200, { email: data.email }, res)
}
