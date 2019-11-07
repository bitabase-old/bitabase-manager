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

  // Validation
  const errors = validate(data)
  if (errors) {
    return sendError(422, { errors }, res)
  }

  // Configuration
  const configFile = path.resolve(__dirname, '../../../data', `example/${data.id}.json`)

  await ensureDirectoryExists(configFile, { resolve: true })

  const existingConfig = await getConfig(configFile)
  if (existingConfig) {
    return sendError(422, { errors: { id: 'already taken' } }, res)
  }

  await writeFile(configFile, JSON.stringify(data))

  // Create db
  const db = await connect(`example/${data.id}.db`)

  const fields = Object.keys(data.schema || [])
    .map(fieldKey => {
      return `${fieldKey} TEXT`
    })
    .join(', ')

  const idField = 'id VARCHAR (36) PRIMARY KEY NOT NULL UNIQUE'

  await db.run(`CREATE TABLE ${data.id} (${idField} ${fields ? ', ' + fields : ''})`)
  await db.close()

  // Respond
  res.writeHead(201, {
    'Content-Type': 'application/json'
  })
  res.end(JSON.stringify(data))
}
