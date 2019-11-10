const uuidv4 = require('uuid/v4')
const parseJsonBody = require('../../../modules/parseJsonBody')
const sendJsonResponse = require('../../../modules/sendJsonResponse')
const parseSession = require('../../../modules/sessions')
const setCrossDomainOriginHeaders = require('../../../modules/setCrossDomainOriginHeaders')

function validate (data) {
  const validations = [
    { name: data.name && !data.name.match(/[^a-z0-9]/gi, '') ? '' : 'name must only contain letters and numbers' },
    { name: data.name ? '' : 'name is a required field' }
  ].filter(item => !!Object.values(item)[0])

  if (validations.length > 0) {
    return Object.assign.apply(null, validations)
  }
}

module.exports = function ({ db }) {
  return async function (request, response, params) {
    setCrossDomainOriginHeaders(request, response)

    const data = await parseJsonBody(request)
    const session = await parseSession(db, request)

    if (!session) {
      return sendJsonResponse(401, { errors: ['invalid session provided'] }, response)
    }

    const errors = validate(data)
    if (errors) {
      return sendJsonResponse(422, { errors }, response)
    }

    const sqlFindDatabase = `
        SELECT databases.*
          FROM databases
     LEFT JOIN database_users
            ON database_users.database_id = databases.id
        WHERE name = ?
          AND database_users.user_id = ?
    `

    const database = await db.get(sqlFindDatabase, [params.databaseName, session.user.id])
    if (!database) {
      return sendJsonResponse(404, { error: 'database not found' }, response)
    }

    const sqlFindCollection = `
        SELECT *
          FROM collections
        WHERE name = ?
          AND database_id = ?
    `

    const collection = await db.get(sqlFindCollection, [data.name, database.id])
    if (collection) {
      return sendJsonResponse(422, { errors: { name: 'collection name already exists' } }, response)
    }

    data.id = uuidv4()

    await db.run('INSERT INTO collections (id, database_id, name, schema, date_created) VALUES (?, ?, ?, ?, ?)', [
      data.id, database.id, data.name, JSON.stringify(data), Date.now()
    ])

    response.writeHead(201, {
      'Content-Type': 'application/json'
    })
    response.end(JSON.stringify(data))
  }
}
