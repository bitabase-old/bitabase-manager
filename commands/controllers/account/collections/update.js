const { promisify } = require('util')
const fs = require('fs')
const path = require('path')

const writeFile = promisify(fs.writeFile)

const validate = require('./validate')
const connect = require('../../../modules/db')
const ensureDirectoryExists = require('../../../modules/ensureDirectoryExists')
const parseJsonBody = require('../../../modules/parseJsonBody')

function sendError (statusCode, message, res) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(message, null, 2))
}

async function getConfig (filename) {
  return new Promise((resolve, reject) => {
    fs.stat(filename, (err, stat) => {
      if (err) {
        if (err.code === 'ENOENT') {
          return resolve()
        } else {
          return reject(err)
        }
      } else {
        resolve(stat)
      }
    })
  })
}

module.exports = async function (req, res, params) {
  const data = await parseJsonBody(req)
  data.id = params.collectionId

  // Validation
  const errors = validate(data)
  if (errors) {
    return sendError(422, { errors }, res)
  }

  // Configuration
  const configFile = path.resolve(__dirname, '../../../data', `example/${data.id}.json`)

  await ensureDirectoryExists(configFile, { resolve: true })

  const existingConfig = await getConfig(configFile)
  if (!existingConfig) {
    return sendError(404, {}, res)
  }

  await writeFile(configFile, JSON.stringify(data))

  // Alter db
  const db = await connect(`example/${data.id}.db`)

  const existingFields = (await db.all(`PRAGMA table_info(${data.id})`))
    .map(field => field.name)

  const fieldsToDelete = existingFields
    .filter(field => field !== 'id' && !Object.keys(data.schema).includes(field))
    .map(field => `${field}=''`)

  const fieldsToAdd = Object.keys(data.schema)
    .filter(field => field !== 'id' && !existingFields.includes(field))
    .map(field => {
      return db.run(`ALTER TABLE ${data.id} ADD ${field} TEXT`)
    })
  await Promise.all(fieldsToAdd)

  if (fieldsToDelete.length > 0) {
    await db.run(`UPDATE ${data.id} SET ${fieldsToDelete.join(', ')}`)
  }

  await db.close()

  // Respond
  res.writeHead(200, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(data))
}
