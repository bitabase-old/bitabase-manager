const http = require('http')
const path = require('path')

const mkdirp = require('mkdirp')
const findMyWay = require('find-my-way')
const migrations = require('node-mini-migrations')
const sqlite = require('sqlite')
const config = require('./config')

const setCrossDomainOriginHeaders = require('./modules/setCrossDomainOriginHeaders')

function migrateUp () {
  return migrations.up(
    migrations.prepareRun(path.resolve(__dirname, './migrations'))
  )
}

let server
async function start () {
  mkdirp.sync(config.dataPath)

  await migrateUp()

  const db = await sqlite.open(path.resolve(config.dataPath, 'manager.sqlite'))

  const router = findMyWay({
    defaultRoute: (request, response) => {
      setCrossDomainOriginHeaders(request, response)
      response.writeHead(404)
      response.end('Not Found')
    }
  })
  router.on('OPTIONS', '*', function (request, response) {
    setCrossDomainOriginHeaders(request, response)
    response.end()
  })
  router.on('POST', '/v1/users', require('./commands/user/create.js')({ db }))
  router.on('POST', '/v1/sessions', require('./commands/session/create.js')({ db }))
  router.on('GET', '/v1/sessions/current', require('./commands/session/readCurrent.js')({ db }))
  router.on('GET', '/v1/databases', require('./commands/database/list.js')({ db }))
  router.on('POST', '/v1/databases', require('./commands/database/create.js')({ db }))
  router.on('POST', '/v1/databases/:databaseName/collections', require('./commands/database/collections/create.js')({ db }))
  router.on('GET', '/v1/databases/:databaseName/collections', require('./commands/database/collections/list.js')({ db }))
  router.on('GET', '/v1/databases/:databaseName/collections/:collectionName', require('./commands/database/collections/read.js')({ db }))

  server = http.createServer((req, res) => {
    router.lookup(req, res)
  }).listen(config.port)

  console.log(`[bitabase-manager] Listening on port ${config.port}`)
}

function stop () {
  console.log('[bitabase-manager] Shutting down')
  server && server.close()
}

module.exports = {
  migrateUp,
  start,
  stop
}
