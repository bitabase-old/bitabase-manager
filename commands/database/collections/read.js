const uuidv4 = require('uuid/v4')
const parseJsonBody = require('../../../modules/parseJsonBody')
const sendJsonResponse = require('../../../modules/sendJsonResponse')
const parseSession = require('../../../modules/sessions')
const setCrossDomainOriginHeaders = require('../../../modules/setCrossDomainOriginHeaders')

const config = require('../../../config')

module.exports = function ({ db }) {
  async function readInternal (request, response, params) {
    const sqlFindDatabase = `
        SELECT databases.*
          FROM databases
        WHERE name = ?
    `

    const database = await db.get(sqlFindDatabase, [params.databaseName])
    if (!database) {
      return sendJsonResponse(404, { error: 'database not found' }, response)
    }

    const sqlFindCollections = `
        SELECT *
          FROM collections
        WHERE database_id = ?
          AND name = ?
    `

    const collection = await db.get(sqlFindCollections, [database.id, params.collectionName])

    if (!collection) {
      return sendJsonResponse(404, { error: 'database not found' }, response)
    }

    response.writeHead(200, {
      'Content-Type': 'application/json'
    })
    response.end(JSON.stringify(collection))
  }

  async function read (request, response, params) {
    setCrossDomainOriginHeaders(request, response)

    const data = await parseJsonBody(request)
    const session = await parseSession(db, request)

    if (!session) {
      return sendJsonResponse(401, { errors: ['invalid session provided'] }, response)
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

    const sqlFindCollections = `
        SELECT *
          FROM collections
        WHERE database_id = ?
          AND name = ?
    `

    const collection = await db.get(sqlFindCollections, [database.id, params.collectionName])

    response.writeHead(200, {
      'Content-Type': 'application/json'
    })
    response.end(JSON.stringify(collection))
  }

  return function (request, response, params) {
    if (request.headers['x-internal-secret'] === config.secret) {
      readInternal(request, response, params)
    } else {
      read(request, response, params)
    }
  }
}
